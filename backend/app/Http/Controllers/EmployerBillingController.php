<?php

namespace App\Http\Controllers;

use App\Models\EmployerPayment;
use App\Services\CompanyAccessService;
use App\Services\EmployerBillingService;
use Illuminate\Http\Request;
use RuntimeException;

class EmployerBillingController extends Controller
{
    public function __construct(private EmployerBillingService $billing)
    {
    }

    public function summary()
    {
        $employer = $this->billing->currentEmployer();
        if (!$employer) {
            return response()->json(['message' => 'Khong tim thay ho so doanh nghiep.'], 404);
        }

        return response()->json($this->billing->summary($employer));
    }

    public function checkout(Request $request)
    {
        app(CompanyAccessService::class)->requireCompanyOwner();

        $request->validate([
            'plan_key' => 'required|string',
        ]);

        $employer = $this->billing->currentEmployer();
        if (!$employer) {
            return response()->json(['message' => 'Khong tim thay ho so doanh nghiep.'], 404);
        }

        try {
            $payment = $this->billing->createPayOSCheckout($employer, $request->input('plan_key'));
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        return response()->json([
            'payment' => $this->billing->serializePayment($payment),
            'checkout_url' => $payment->checkout_url,
        ]);
    }

    public function sync($orderCode)
    {
        app(CompanyAccessService::class)->requireCompanyOwner();

        $employer = $this->billing->currentEmployer();
        if (!$employer) {
            return response()->json(['message' => 'Khong tim thay ho so doanh nghiep.'], 404);
        }

        $payment = EmployerPayment::where('employer_id', $employer->id)
            ->where('order_code', $orderCode)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Khong tim thay giao dich.'], 404);
        }

        try {
            $payment = $this->billing->syncPayOSPayment($payment);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        return response()->json([
            'payment' => $this->billing->serializePayment($payment),
            'summary' => $this->billing->summary($employer),
        ]);
    }

    public function webhook(Request $request)
    {
        $payload = $request->all();

        if (!$this->billing->verifyPayOSWebhook($payload)) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $this->billing->handlePayOSWebhook($payload);

        return response()->json(['success' => true]);
    }
}
