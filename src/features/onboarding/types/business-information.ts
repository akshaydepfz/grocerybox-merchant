export type BusinessInformationFormValues = {
  businessName: string;
  businessType: string | null;
  ownerFullName: string;
  mobileNumber: string;
  email: string;
  gstin: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
};

export type BusinessInformationData = {
  businessName: string;
  businessType: string;
  ownerFullName: string;
  mobileNumber: string;
  email: string;
  gstin: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
};

export function businessInformationToJson(
  values: BusinessInformationFormValues,
): Record<string, string | null> {
  return {
    business_name: values.businessName,
    business_type: values.businessType,
    owner_full_name: values.ownerFullName,
    mobile_number: values.mobileNumber,
    email: values.email,
    gstin: values.gstin,
    address_line1: values.addressLine1,
    address_line2: values.addressLine2,
    state: values.state,
    district: values.district,
    city: values.city,
    pin_code: values.pinCode,
  };
}

export function businessInformationFromEnvelopeData(
  data: Record<string, unknown>,
): BusinessInformationData {
  const business = data.business as Record<string, unknown>;
  return {
    businessName: (business.business_name as string) ?? "",
    businessType: (business.business_type as string) ?? "",
    ownerFullName: (business.owner_full_name as string) ?? "",
    mobileNumber: (business.mobile_number as string) ?? "",
    email: (business.email as string) ?? "",
    gstin: (business.gstin as string) ?? "",
    addressLine1: (business.address_line1 as string) ?? "",
    addressLine2: (business.address_line2 as string) ?? "",
    state: (business.state as string) ?? "",
    district: (business.district as string) ?? "",
    city: (business.city as string) ?? "",
    pinCode: (business.pin_code as string) ?? "",
  };
}

export function defaultBusinessFormValues(
  signedInEmail = "",
): BusinessInformationFormValues {
  return {
    businessName: "",
    businessType: null,
    ownerFullName: "",
    mobileNumber: "",
    email: signedInEmail,
    gstin: "",
    addressLine1: "",
    addressLine2: "",
    state: "Kerala",
    district: "Kozhikode",
    city: "Kozhikode",
    pinCode: "673001",
  };
}
