<?php

namespace Tests\Unit;

use App\Services\GoogleMapLinkResolver;
use PHPUnit\Framework\TestCase;

class GoogleMapLinkResolverTest extends TestCase
{
    public function test_it_extracts_anonymous_map_point_from_search_url(): void
    {
        $resolver = new GoogleMapLinkResolver();
        $url = 'https://www.google.com/maps/search/10.983682,+106.676790?entry=tts';

        $coordinates = $resolver->extractCoordinates($url);

        $this->assertSame(10.983682, $coordinates['lat']);
        $this->assertSame(106.676790, $coordinates['lng']);
    }

    public function test_it_prefers_place_marker_coordinates_over_camera_coordinates(): void
    {
        $resolver = new GoogleMapLinkResolver();
        $url = 'https://www.google.com/maps/place/Cafe+C%C3%B4+H%E1%BA%A1nh/@10.9836337,106.6766218,21z/data=!4m6!3m5!1s0x3174d100522e77e9:0x583dff60ab1e1e99!8m2!3d10.9837713!4d106.6767746!16s%2Fg%2F11n9l1jgqn?entry=ttu';

        $coordinates = $resolver->extractCoordinates($url);

        $this->assertSame(10.9837713, $coordinates['lat']);
        $this->assertSame(106.6767746, $coordinates['lng']);
    }

    public function test_it_extracts_coordinates_from_encoded_query_parameter(): void
    {
        $resolver = new GoogleMapLinkResolver();
        $url = 'https://www.google.com/maps/search/?api=1&query=10.983682%2C+106.676790';

        $coordinates = $resolver->extractCoordinates($url);

        $this->assertSame(10.983682, $coordinates['lat']);
        $this->assertSame(106.676790, $coordinates['lng']);
    }
}
