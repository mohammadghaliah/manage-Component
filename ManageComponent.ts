import { Directive, OnInit } from '@angular/core';

@Directive()
export abstract class ManageComponent<TEntity, TEntityFilter> {}
