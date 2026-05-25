<?php

namespace App\Services;

use App\Models\Employer;
use App\Models\EmployerPayment;
use App\Models\EmployerSubscription;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class EmployerBillingService
{
    public function currentEmployer(): ?Employer
    {
        $member = app(CompanyAccessService::class)->currentMember(Auth::id());
        if ($member) {
            return Employer::find($member->employer_id);
        }

        return Employer::where('user_id', Auth::id())->first();
    }

    public function plans(): array
    {
        return collect(config('employer_billing.plans', []))
            ->map(function ($plan, $key) {
                return array_merge([
                    'key' => $key,
                    'rank' => $this->planRank($key),
                ], $plan);
            })
            ->values()
            ->all();
    }

    public function planRank(string $planKey): int
    {
        $keys = array_keys(config('employer_billing.plans', []));
        $rank = array_search($planKey, $keys, true);

        return $rank === false ? -1 : (int) $rank;
    }

    public function plan(string $planKey): array
    {
        $plan = config("employer_billing.plans.{$planKey}");
        if (!$plan) {
            throw ValidationException::withMessages([
                'plan_key' => 'Goi thanh toan khong hop le.',
            ]);
        }

        return $plan;
    }

    public function activeSubscription(int $employerId): ?EmployerSubscription
    {
        return EmployerSubscription::where('employer_id', $employerId)
            ->where('status', 'ACTIVE')
            ->where('ends_at', '>=', Carbon::now())
            ->orderByDesc('ends_at')
            ->first();
    }

    public function summary(Employer $employer): array
    {
        $subscription = $this->activeSubscription($employer->id);
        $latestPayment = EmployerPayment::where('employer_id', $employer->id)
            ->orderByDesc('created_at')
            ->first();

        return [
            'payos_configured' => $this->payOSConfigured(),
            'plans' => $this->plans(),
            'current_subscription' => $subscription ? $this->serializeSubscription($subscription) : null,
            'latest_payment' => $latestPayment ? $this->serializePayment($latestPayment) : null,
        ];
    }

    public function checkAccessForEmployerUser(?int $userId, string $feature): array
    {
        if (!$userId) {
            return $this->accessDenied('PAYMENT_REQUIRED', 'Ban can dang nhap bang tai khoan nha tuyen dung.');
        }

        $member = app(CompanyAccessService::class)->currentMember($userId);
        $employer = $member ? Employer::find($member->employer_id) : Employer::where('user_id', $userId)->first();
        if (!$employer) {
            return $this->accessDenied('PAYMENT_REQUIRED', 'Khong tim thay ho so doanh nghiep.');
        }

        $subscription = $this->activeSubscription($employer->id);
        if (!$subscription) {
            return $this->accessDenied(
                'PAYMENT_REQUIRED',
                'Vui long thanh toan mot goi dich vu de su dung tinh nang nay.',
                $employer
            );
        }

        if ($feature === 'job_post' && $subscription->job_posts_limit !== null) {
            if ($subscription->job_posts_used >= $subscription->job_posts_limit) {
                return $this->accessDenied(
                    'JOB_POST_LIMIT_REACHED',
                    'Goi hien tai da het luot dang tin. Vui long nang cap hoac mua goi moi.',
                    $employer,
                    $subscription
                );
            }
        }

        if ($feature === 'candidate_search' && !$subscription->candidate_search_enabled) {
            return $this->accessDenied(
                'FEATURE_REQUIRES_UPGRADE',
                'Tinh nang tim kiem va lien he ung vien can goi Tang Truong hoac Chuyen Nghiep.',
                $employer,
                $subscription
            );
        }

        return [
            'allowed' => true,
            'employer' => $employer,
            'subscription' => $subscription,
        ];
    }

    public function consumeJobPost(EmployerSubscription $subscription): void
    {
        $subscription->increment('job_posts_used');
    }

    public function createPayOSCheckout(Employer $employer, string $planKey): EmployerPayment
    {
        $plan = $this->plan($planKey);
        $this->assertPlanCanBePurchased($employer, $planKey);

        if (!$this->payOSConfigured()) {
            throw new RuntimeException('PAYOS credentials are not configured.');
        }

        $orderCode = $this->createUniqueOrderCode();
        $description = 'RW' . substr((string) $orderCode, -7);
        $returnUrl = $this->frontendUrl('/employer/billing');
        $cancelUrl = $this->frontendUrl('/employer/billing');

        $payment = EmployerPayment::create([
            'employer_id' => $employer->id,
            'order_code' => $orderCode,
            'plan_key' => $planKey,
            'amount' => $plan['amount'],
            'currency' => config('employer_billing.currency', 'VND'),
            'status' => 'PENDING',
        ]);

        $signaturePayload = [
            'amount' => $plan['amount'],
            'cancelUrl' => $cancelUrl,
            'description' => $description,
            'orderCode' => $orderCode,
            'returnUrl' => $returnUrl,
        ];

        $payload = array_merge($signaturePayload, [
            'buyerName' => $employer->name,
            'items' => [
                [
                    'name' => $plan['name'],
                    'quantity' => 1,
                    'price' => $plan['amount'],
                ],
            ],
            'signature' => $this->payOSSignature($signaturePayload),
        ]);

        try {
            $response = $this->payOSClient()->post('/v2/payment-requests', [
                'headers' => $this->payOSHeaders(),
                'json' => $payload,
            ]);
        } catch (Throwable $exception) {
            $payment->update(['status' => 'FAILED']);
            throw new RuntimeException('Khong the ket noi payOS: ' . $exception->getMessage());
        }

        $body = json_decode((string) $response->getBody(), true);
        if (($body['code'] ?? null) !== '00') {
            $payment->update([
                'status' => 'FAILED',
                'provider_payload' => $body,
            ]);

            throw new RuntimeException($body['desc'] ?? 'Cannot create payOS checkout link.');
        }

        $payment->update([
            'checkout_url' => $body['data']['checkoutUrl'] ?? null,
            'payment_link_id' => $body['data']['paymentLinkId'] ?? null,
            'provider_payload' => $body,
        ]);

        return $payment->fresh();
    }

    public function syncPayOSPayment(EmployerPayment $payment): EmployerPayment
    {
        if (!$this->payOSConfigured()) {
            throw new RuntimeException('PAYOS credentials are not configured.');
        }

        try {
            $response = $this->payOSClient()->get('/v2/payment-requests/' . $payment->order_code, [
                'headers' => $this->payOSHeaders(),
            ]);
        } catch (Throwable $exception) {
            throw new RuntimeException('Khong the dong bo payOS: ' . $exception->getMessage());
        }

        $body = json_decode((string) $response->getBody(), true);
        $status = $body['data']['status'] ?? $payment->status;

        if ($status === 'PAID') {
            $this->markPaymentPaid($payment, $body);
        } elseif ($status === 'CANCELLED') {
            $payment->update([
                'status' => 'CANCELLED',
                'provider_payload' => $body,
                'cancelled_at' => Carbon::now(),
            ]);
        } else {
            $payment->update([
                'status' => $status,
                'provider_payload' => $body,
            ]);
        }

        return $payment->fresh();
    }

    public function verifyPayOSWebhook(array $payload): bool
    {
        if (!$this->payOSConfigured()) {
            return false;
        }

        if (!isset($payload['data'], $payload['signature']) || !is_array($payload['data'])) {
            return false;
        }

        return hash_equals(
            $this->payOSSignature($payload['data']),
            (string) $payload['signature']
        );
    }

    public function handlePayOSWebhook(array $payload): ?EmployerPayment
    {
        $data = $payload['data'] ?? [];
        $orderCode = $data['orderCode'] ?? null;

        if (!$orderCode) {
            return null;
        }

        $payment = EmployerPayment::where('order_code', $orderCode)->first();
        if (!$payment) {
            return null;
        }

        if (($payload['success'] ?? false) && ($data['code'] ?? null) === '00') {
            $this->markPaymentPaid($payment, $payload);
        } else {
            $payment->update([
                'status' => $data['code'] ?? 'FAILED',
                'provider_payload' => $payload,
            ]);
        }

        return $payment->fresh();
    }

    public function serializePayment(EmployerPayment $payment): array
    {
        return [
            'id' => $payment->id,
            'order_code' => $payment->order_code,
            'plan_key' => $payment->plan_key,
            'amount' => $payment->amount,
            'currency' => $payment->currency,
            'status' => $payment->status,
            'checkout_url' => $payment->checkout_url,
            'payment_link_id' => $payment->payment_link_id,
            'paid_at' => optional($payment->paid_at)->toIso8601String(),
            'cancelled_at' => optional($payment->cancelled_at)->toIso8601String(),
            'created_at' => optional($payment->created_at)->toIso8601String(),
        ];
    }

    private function markPaymentPaid(EmployerPayment $payment, array $providerPayload): void
    {
        DB::transaction(function () use ($payment, $providerPayload) {
            $payment->refresh();

            if ($payment->status !== 'PAID') {
                $payment->update([
                    'status' => 'PAID',
                    'provider_payload' => $providerPayload,
                    'paid_at' => Carbon::now(),
                ]);
            }

            $existingSubscription = EmployerSubscription::where('employer_payment_id', $payment->id)->first();
            if ($existingSubscription) {
                return;
            }

            $plan = $this->plan($payment->plan_key);
            $startsAt = Carbon::now();
            $endsAt = (clone $startsAt)->addDays((int) $plan['duration_days']);

            EmployerSubscription::where('employer_id', $payment->employer_id)
                ->where('status', 'ACTIVE')
                ->update(['status' => 'EXPIRED']);

            EmployerSubscription::create([
                'employer_id' => $payment->employer_id,
                'employer_payment_id' => $payment->id,
                'plan_key' => $payment->plan_key,
                'status' => 'ACTIVE',
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'job_posts_limit' => $plan['job_posts'],
                'job_posts_used' => 0,
                'candidate_search_enabled' => (bool) $plan['candidate_search'],
            ]);
        });
    }

    private function serializeSubscription(EmployerSubscription $subscription): array
    {
        $plan = config("employer_billing.plans.{$subscription->plan_key}", []);
        $remaining = $subscription->job_posts_limit === null
            ? null
            : max(0, $subscription->job_posts_limit - $subscription->job_posts_used);

        return [
            'id' => $subscription->id,
            'plan_key' => $subscription->plan_key,
            'plan_rank' => $this->planRank($subscription->plan_key),
            'plan_name' => $plan['name'] ?? $subscription->plan_key,
            'status' => $subscription->status,
            'starts_at' => optional($subscription->starts_at)->toIso8601String(),
            'ends_at' => optional($subscription->ends_at)->toIso8601String(),
            'job_posts_limit' => $subscription->job_posts_limit,
            'job_posts_used' => $subscription->job_posts_used,
            'remaining_job_posts' => $remaining,
            'candidate_search_enabled' => $subscription->candidate_search_enabled,
        ];
    }

    private function assertPlanCanBePurchased(Employer $employer, string $planKey): void
    {
        $subscription = $this->activeSubscription($employer->id);
        if (!$subscription) {
            return;
        }

        $currentRank = $this->planRank($subscription->plan_key);
        $nextRank = $this->planRank($planKey);

        if ($nextRank >= 0 && $currentRank >= 0 && $nextRank < $currentRank) {
            throw ValidationException::withMessages([
                'plan_key' => 'Bạn đang dùng gói cao hơn. Không thể mua gói thấp hơn khi gói hiện tại còn hiệu lực.',
            ]);
        }
    }

    private function accessDenied(
        string $code,
        string $message,
        ?Employer $employer = null,
        ?EmployerSubscription $subscription = null
    ): array {
        return [
            'allowed' => false,
            'code' => $code,
            'message' => $message,
            'employer' => $employer,
            'subscription' => $subscription,
        ];
    }

    private function createUniqueOrderCode(): int
    {
        do {
            $orderCode = random_int(100000000, 999999999);
        } while (EmployerPayment::where('order_code', $orderCode)->exists());

        return $orderCode;
    }

    private function payOSSignature(array $data): string
    {
        ksort($data);
        $query = collect($data)
            ->map(fn ($value, $key) => $key . '=' . $this->signatureValue($value))
            ->implode('&');

        return hash_hmac('sha256', $query, (string) config('services.payos.checksum_key'));
    }

    private function signatureValue($value): string
    {
        if ($value === null || $value === 'null' || $value === 'undefined') {
            return '';
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_array($value)) {
            return json_encode($this->sortArrayKeys($value), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return (string) $value;
    }

    private function sortArrayKeys(array $value): array
    {
        if (array_is_list($value)) {
            return array_map(fn ($item) => is_array($item) ? $this->sortArrayKeys($item) : $item, $value);
        }

        ksort($value);

        foreach ($value as $key => $item) {
            if (is_array($item)) {
                $value[$key] = $this->sortArrayKeys($item);
            }
        }

        return $value;
    }

    private function payOSConfigured(): bool
    {
        return filled(config('services.payos.client_id'))
            && filled(config('services.payos.api_key'))
            && filled(config('services.payos.checksum_key'));
    }

    private function payOSClient(): Client
    {
        return new Client([
            'base_uri' => rtrim(config('services.payos.base_url'), '/'),
            'timeout' => 30,
        ]);
    }

    private function payOSHeaders(): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'x-client-id' => config('services.payos.client_id'),
            'x-api-key' => config('services.payos.api_key'),
        ];

        if (filled(config('services.payos.partner_code'))) {
            $headers['x-partner-code'] = config('services.payos.partner_code');
        }

        return $headers;
    }

    private function frontendUrl(string $path): string
    {
        return rtrim(config('services.frontend.url'), '/') . $path;
    }
}
