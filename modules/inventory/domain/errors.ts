export class InsufficientStockError extends Error {
  constructor(public itemId: string, public available: string, public requested: string) {
    super(`Negative Stock Policy Violation: Cannot issue ${requested}. Only ${available} available on-hand.`);
    this.name = "InsufficientStockError";
  }
}

export class ItemNotFoundError extends Error {
  constructor(public itemIdentifier: string) {
    super(`Inventory item '${itemIdentifier}' not found in active organization.`);
    this.name = "ItemNotFoundError";
  }
}

export class LocationNotFoundError extends Error {
  constructor(public locationIdentifier: string) {
    super(`Inventory location '${locationIdentifier}' not found in active organization.`);
    this.name = "LocationNotFoundError";
  }
}

export class DuplicateItemCodeError extends Error {
  constructor(public itemCode: string) {
    super(`Inventory item code '${itemCode}' already exists in active organization.`);
    this.name = "DuplicateItemCodeError";
  }
}

export class InvalidMovementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMovementError";
  }
}

export class IdempotencyConflictError extends Error {
  constructor(public key: string) {
    super(`Idempotency key '${key}' was previously used with a different request payload.`);
    this.name = "IdempotencyConflictError";
  }
}
