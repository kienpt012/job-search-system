# Candidate Location Map Update

## Thay ??i DB

Th?m 2 c?t m?i v?o b?ng `candidates`:
- `map_lat`
- `map_lng`

## C?ch c?p nh?t

### N?u d?ng migration Laravel

Ch?y trong th? m?c `backend`:

```bash
php artisan migrate
```

### N?u c?p nh?t b?ng phpMyAdmin / recruitment.sql

Ch?y c?u SQL sau:

```sql
ALTER TABLE candidates
  ADD COLUMN map_lat DECIMAL(10,7) NULL AFTER address,
  ADD COLUMN map_lng DECIMAL(10,7) NULL AFTER map_lat;
```

## Sau khi c?p nh?t

1. Kh?i ??ng l?i backend n?u ?ang ch?y cache route / config.
2. M? trang `candidate/profile`.
3. V?o `Th?ng tin c? nh?n`, ghim v? tr? b?ng b?n ??, link Google Maps ho?c GPS.
4. V? trang ch? ?? xem kh?i `??y l? nh?ng c?ng ty g?n n?i ? c?a b?n (<10km)`.
