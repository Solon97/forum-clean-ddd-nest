export abstract class WatchedList<T> {
  private _currentItems: T[];
  private initial: T[];
  private new: T[];
  private removed: T[];

  constructor(initialItems?: T[]) {
    this._currentItems = initialItems ? [...initialItems] : [];
    this.initial = initialItems ? [...initialItems] : [];
    this.new = [];
    this.removed = [];
  }

  abstract compareItems(a: T, b: T): boolean;

  get currentItems(): T[] {
    return this._currentItems;
  }

  get newItems(): T[] {
    return this.new;
  }

  get removedItems(): T[] {
    return this.removed;
  }

  public exists(item: T): boolean {
    return this.isCurrentItem(item);
  }

  public add(item: T): void {
    if (this.isRemovedItem(item)) {
      this.removed = this.removed.filter((v) => !this.compareItems(item, v));
    }
    const wasAddedInitially =
      this.initial.filter((v: T) => this.compareItems(item, v)).length !== 0;

    if (!this.isNewItem(item) && !wasAddedInitially) {
      this.new.push(item);
    }

    if (!this.isCurrentItem(item)) {
      this._currentItems.push(item);
    }
  }

  public remove(item: T): void {
    this._currentItems = this._currentItems.filter(
      (v) => !this.compareItems(item, v),
    );

    if (this.isNewItem(item)) {
      this.new = this.new.filter((v) => !this.compareItems(v, item));
      return;
    }

    if (!this.isRemovedItem(item)) {
      this.removed.push(item);
    }
  }

  public update(items: T[]): void {
    const newItems = items.filter((a) => {
      return !this._currentItems.some((b) => this.compareItems(a, b));
    });

    const removedItems = this._currentItems.filter((a) => {
      return !items.some((b) => this.compareItems(a, b));
    });

    this._currentItems = items;
    this.new = newItems;
    this.removed = removedItems;
  }

  private isCurrentItem(item: T): boolean {
    return (
      this._currentItems.filter((v: T) => this.compareItems(item, v)).length !==
      0
    );
  }

  private isNewItem(item: T): boolean {
    return this.new.filter((v: T) => this.compareItems(item, v)).length !== 0;
  }

  private isRemovedItem(item: T): boolean {
    return (
      this.removed.filter((v: T) => this.compareItems(item, v)).length !== 0
    );
  }
}
