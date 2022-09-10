import { Directive, OnInit } from '@angular/core';

@Directive()
export abstract class ManageComponent<TEntity, TEntityFilter> {
  entity: TEntity;

  constructor(private entityType: new () => TEntity) {
    this.entity = new entityType();
  }

  ngOnInit() {
    console.log(this.entity);
  }
}
