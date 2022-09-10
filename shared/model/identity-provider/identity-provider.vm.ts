export class IdentityProvider {
  constructor() {}
  identityProvidersId: number;
  accountId: number;
  name: string;
  description: string;
  typeCode: string;
  config: any;
  isVisible: boolean;
  linkingProperty: string;
  linkingUserCustomDataLinkingProperty: string;
  isExistExternalProvider: boolean;
  extraClaimMappingEnabled?: boolean = false;
}

export class IdentityProviderFilter {
  constructor() {}
  accountId: number;
  keyword: string;
  typeCode: string;
}
