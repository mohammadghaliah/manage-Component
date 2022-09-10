import { Component, VERSION } from '@angular/core';
import {
  IdentityProvider,
  IdentityProviderFilter,
} from '../../shared/model/identity-provider/identity-provider.vm';
import { ManageComponent } from './ManageComponent';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent extends ManageComponent<
  IdentityProvider,
  IdentityProviderFilter
> {}
