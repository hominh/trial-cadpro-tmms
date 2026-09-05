# Provider Integration Evidence: Device Management

This checklist remains open while development uses MSW. It may be completed only against the real
backend implementing `contracts/device-management.openapi.yaml`.

## Provider contract gate (T015)

- [ ] All 23 operations pass schema and status-code validation.
- [ ] Session context returns the seeded current actor and permissions; unauthorized direct calls return 403.
- [ ] Feature and enforcement request representations expose opaque ETags; stale If-Match returns 412.
- [ ] Every POST/PUT/DELETE mutation honors Idempotency-Key for retry of the same logical mutation.
- [ ] Feature state/history and enforcement decision/history changes are transaction-atomic.
- [ ] Object/device codes remain unavailable after soft delete; preset uniqueness follows device scope.
- [ ] Soft-delete retention and polygon/PTZ/calibration invariants pass.

## US1 provider checkpoint (T035)

- [ ] Bounded catalog, search cancellation, object attrs and device config scenarios pass.
- [ ] Create/full-replacement PUT/soft-delete and stale-version scenarios pass.
- [ ] Request/response trace or CI artifact link recorded: _pending_.

## US2 provider checkpoint (T049)

- [ ] Normal toggle, forced audit rollback, pending enforcement and self-approval denial pass.
- [ ] Different-user approve/reject and deleted-device history retention pass.
- [ ] Transaction/authorization evidence link recorded: _pending_.

## US3 provider checkpoint (T064)

- [ ] Draft/calibrated transitions, 501-vertex rejection and invalid geometry retention pass.
- [ ] Duplicate preset, full-replacement PUT, stale-version and soft-delete scenarios pass.
- [ ] Geometry/calibration evidence link recorded: _pending_.
