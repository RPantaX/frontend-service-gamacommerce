export interface ApiResponse<T> {
  error: boolean;
  code: string;
  title: string;
  message: string;
  type: 'E' | 'W' | null;
  date: string;
  data: T;
}

export interface CatalogItem {
  id: number;
  value: string;
}

export interface CompanyAddressDto {
  id: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
export interface PersonAddressDto {
  id: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CompanyPersonDto {
  id: number;
  name: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  addressId: number;
  documentTypeId: number;
  documentNumber: string;
  documentType?: DocumentTypeDto;
  fullName: string;
  address: PersonAddressDto;
}
export interface DocumentTypeDto {
  id: number;
  value: string;
}
export interface CompanyContractDto {
  id: number;
  timeMonth: number;
  contractState: boolean;
  active: boolean;
  contractKindDto : ContractKindDto;
}
export interface ContractKindDto {
  id: number;
  value: string;
}
export interface CompanyDtoLite {
  id: number;
  companyRuc: string;
  companyName: string;
  companyTradeName: string;
  companyPhone: string;
  companyEmail: string;
  image?: string | null;
}

export interface CompanyDetailDto {
  id: number;
  companyRuc: string;
  companyName: string;
  companyTradeName: string;
  companyPhone: string;
  companyEmail: string;
  documentTypeName: string;
  companyDocumentNumber: string;
  companyTypeName: string;
  companyAddressDto: CompanyAddressDto;
  personDto: CompanyPersonDto;
  contractDto: CompanyContractDto;
  image?: string | null;
  responseUsers: ResponseUserDto[];
}
export interface RoleDto {
  id: number;
  name: string;
}

export interface ResponseUserDto {
  id: number;
  keycloakId: string | null;
  username: string;
  password: string | null;
  enabled: boolean | null;
  admin: boolean;
  email: string;
  roleIds: number[] | null;
  roles: RoleDto[];
  companyDto: CompanyDtoLite | null; // Se asume que podría ser CompanyDtoLite o null
}
export interface ResponseListPageableCompany {
  companyDtoList: CompanyDtoLite[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  end: boolean;
}

/** REQUEST EXACTO que envías a /company/create */
export interface CreateCompanyRequest {
  person: {
    personDocumentNumber: string;
    personName: string;
    personLastName: string;
    personPhoneNumber: string;
    personEmailAddress: string;
    personAddressStreet: string;
    personAddressCity: string;
    personAddressState: string;
    personAddressPostalCode: string;
    personAddressCountry: string;
    personDocumentId: number; // documentTypeId (persona)
  };
  company: {
    contractRequest: {
      contractTimeMonth: number;
      contractKindId: number;
    };
    companyTypeId: number;
    companyDocumentId: number; // documentTypeId (empresa)
    image?: File;
    companyTradeName: string;
    companyRUC: string;
    companyPhone: string;
    companyEmail: string;
     deleteFile?: boolean;
  };
}

export interface CreateCompanyResponse {
  companyDto : CompanyDtoLite;
  userDto : ResponseUserDto;
}
