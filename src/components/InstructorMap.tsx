'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Instructor } from '@/types';

interface Props {
  instructors: Instructor[];
  origin?: { lat: number; lng: number } | null;
  radiusKm?: number | null;
  className?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validCoordinate(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0)
  );
}

export default function InstructorMap({ instructors, origin, radiusKm, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const originRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-27.47, 133.02],
      zoom: 4,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    originRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // The panel is often hidden when the map is first created, so recalculate
    // its size once the browser has laid it out.
    const timer = window.setTimeout(() => map.invalidateSize(), 100);

    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
      originRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    const originLayer = originRef.current;
    if (!map || !markers || !originLayer) return;

    markers.clearLayers();
    originLayer.clearLayers();

    const points: L.LatLngExpression[] = [];

    const markerIcon = L.divIcon({
      className: 'lcardrive-map-pin',
      html: '<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#064E3B;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);transform:rotate(-45deg)"><span style="display:block;transform:rotate(45deg);color:#fff;font-size:12px;font-weight:700;line-height:24px;text-align:center">&#9733;</span></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

    for (const instructor of instructors) {
      if (!validCoordinate(instructor.lat, instructor.lng)) continue;
      const position: L.LatLngExpression = [instructor.lat as number, instructor.lng as number];
      points.push(position);

      const name = escapeHtml(`${instructor.first_name} ${instructor.last_name}`);
      const suburb = escapeHtml(instructor.suburb || '');
      const price =
        typeof instructor.hourly_rate === 'number' && instructor.hourly_rate > 0
          ? `$${instructor.hourly_rate}/hr`
          : '';
      const distance =
        typeof instructor.distance_km === 'number'
          ? `${instructor.distance_km.toFixed(1)} km away`
          : '';
      const profileUrl = `/instructors/${encodeURIComponent(
        (instructor.suburb || '').toLowerCase().replace(/\s+/g, '-'),
      )}/${encodeURIComponent(instructor.slug)}`;

      const popup = `
        <div style="min-width:180px;font-family:inherit">
          <div style="font-weight:700;font-size:14px;color:#111827">${name}</div>
          <div style="font-size:12px;color:#64748B;margin-top:2px">${suburb}${distance ? ` &bull; ${distance}` : ''}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px">
            <span style="font-size:13px;font-weight:700;color:#111827">${price}</span>
            <a href="${profileUrl}" style="background:#064E3B;color:#fff;padding:5px 10px;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none">View profile</a>
          </div>
        </div>`;

      L.marker(position, { icon: markerIcon, title: `${instructor.first_name} ${instructor.last_name}` })
        .bindPopup(popup)
        .addTo(markers);
    }

    if (origin && validCoordinate(origin.lat, origin.lng)) {
      const originPosition: L.LatLngExpression = [origin.lat, origin.lng];
      points.push(originPosition);

      L.circleMarker(originPosition, {
        radius: 7,
        color: '#064E3B',
        fillColor: '#064E3B',
        fillOpacity: 0.9,
        weight: 3,
      })
        .bindPopup('<strong>Your search area</strong>')
        .addTo(originLayer);

      if (radiusKm && radiusKm > 0) {
        L.circle(originPosition, {
          radius: radiusKm * 1000,
          color: '#064E3B',
          weight: 1,
          fillColor: '#064E3B',
          fillOpacity: 0.06,
        }).addTo(originLayer);
      }
    }

    if (points.length === 1) {
      map.setView(points[0], 11);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points).pad(0.15), { maxZoom: 12 });
    } else {
      map.setView([-27.47, 133.02], 4);
    }

    window.setTimeout(() => map.invalidateSize(), 50);
  }, [instructors, origin, radiusKm]);

  return <div ref={containerRef} className={`h-full w-full ${className}`} />;
}
