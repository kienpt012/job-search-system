<?php

namespace App\Services;

class GoogleMapLinkResolver
{
    public function resolve(string $url): ?array
    {
        $url = trim($url);
        if ($url === '') {
            return null;
        }

        $localCoordinates = $this->extractCoordinates($url);
        if ($localCoordinates) {
            return array_merge($localCoordinates, ['resolved_url' => $url]);
        }

        $response = $this->followRedirects($url);
        if (!$response) {
            return null;
        }

        [$finalUrl, $body] = $response;
        $coordinates = $this->extractCoordinates($finalUrl, $body);

        return $coordinates
            ? array_merge($coordinates, ['resolved_url' => $finalUrl])
            : null;
    }

    public function extractCoordinates(string $url, string $body = ''): ?array
    {
        $signedNumber = '([+-]?\d+(?:\.\d+)?)';

        $latLngPatterns = [
            '/!8m2!3d' . $signedNumber . '!4d' . $signedNumber . '/i',
            '/!4m2!3d' . $signedNumber . '!4d' . $signedNumber . '/i',
            '/!3d' . $signedNumber . '!4d' . $signedNumber . '/i',
            '/\/maps\/search\/' . $signedNumber . '\s*,\s*' . $signedNumber . '/i',
            '/[?&](?:query|q|destination|center|ll|sll)=' . $signedNumber . '\s*,\s*' . $signedNumber . '/i',
            '/@' . $signedNumber . ',' . $signedNumber . ',/i',
        ];

        foreach ($this->payloadSources($url, $body) as $source) {
            foreach ($latLngPatterns as $pattern) {
                if (preg_match($pattern, $source, $matches)) {
                    return $this->coordinates((float) $matches[1], (float) $matches[2]);
                }
            }

            if (preg_match_all("/https?:\/\/www\.google\.com\/maps\/[^\"'\s<]+/i", $source, $embeddedUrls)) {
                foreach ($embeddedUrls[0] as $embeddedUrl) {
                    if ($embeddedUrl === $source) {
                        continue;
                    }

                    $embeddedCoordinates = $this->extractCoordinates($embeddedUrl);
                    if ($embeddedCoordinates) {
                        return $embeddedCoordinates;
                    }
                }
            }
        }

        return null;
    }

    private function followRedirects(string $url): ?array
    {
        if (!function_exists('curl_init')) {
            return $this->followRedirectsWithStreams($url);
        }

        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 8,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_USERAGENT => 'Mozilla/5.0 RecruitmentMapResolver/1.0',
            CURLOPT_HTTPHEADER => ['Accept-Language: vi,en;q=0.9'],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        $body = curl_exec($curl);
        $finalUrl = curl_getinfo($curl, CURLINFO_EFFECTIVE_URL);
        $error = curl_errno($curl);
        curl_close($curl);

        if ($error || !$finalUrl) {
            return null;
        }

        return [$finalUrl, (string) $body];
    }

    private function followRedirectsWithStreams(string $url): ?array
    {
        if (!filter_var(ini_get('allow_url_fopen'), FILTER_VALIDATE_BOOLEAN)) {
            return null;
        }

        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => [
                    'User-Agent: Mozilla/5.0 RecruitmentMapResolver/1.0',
                    'Accept-Language: vi,en;q=0.9',
                ],
                'timeout' => 15,
                'follow_location' => 1,
                'max_redirects' => 8,
                'ignore_errors' => true,
            ],
        ]);

        $body = @file_get_contents($url, false, $context);
        if ($body === false) {
            return null;
        }

        return [$this->effectiveUrlFromHeaders($http_response_header ?? [], $url), (string) $body];
    }

    private function effectiveUrlFromHeaders(array $headers, string $fallback): string
    {
        $effectiveUrl = $fallback;

        foreach ($headers as $header) {
            if (stripos($header, 'Location:') === 0) {
                $location = trim(substr($header, strlen('Location:')));
                if ($location !== '') {
                    $effectiveUrl = $location;
                }
            }
        }

        return $effectiveUrl;
    }

    private function payloadSources(string $url, string $body): array
    {
        $rawSources = [
            $url,
            $body,
            html_entity_decode($url, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
            html_entity_decode($body, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        ];

        $sources = [];
        foreach ($rawSources as $source) {
            $source = (string) $source;
            if ($source === '') {
                continue;
            }

            $sources[] = $source;
            $sources[] = rawurldecode($source);
            $sources[] = urldecode($source);
            $sources[] = rawurldecode(html_entity_decode($source, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $sources[] = urldecode(html_entity_decode($source, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        }

        return array_values(array_unique(array_filter($sources, fn ($source) => $source !== '')));
    }

    private function coordinates(float $lat, float $lng): ?array
    {
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return null;
        }

        return [
            'lat' => $lat,
            'lng' => $lng,
        ];
    }
}
