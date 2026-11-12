export const ONBOARDING_STEPS = [
  "Business Information",
  "Store Identity",
  "Store Branding",
  "Store Location",
  "Store Configuration",
  "Review & Publish",
] as const;

export const ONBOARDING_TOTAL_STEPS = ONBOARDING_STEPS.length;

export const ONBOARDING_STORE_ILLUSTRATION_URL =
  "https://lh3.googleusercontent.com/aida/AEtjO1XdCAKtiQMHccraKHGpyuH8WuIrLZVPydGVLKB1KYDhDsM4jjK01eY_pi3wRpPdG5toaEuw__LYdZYhidqTB0pTFx-PS1StWi-uLm1F_CuVwexiRFWuDAM5eFkaYp8MCKsbcN5tPn5rYZgCtkhm9CzifSomxitVjctoeTvyPYnvx5Mh9LEzJ71LJzHrq75CMFPeuFxI-N9Nfkqlvipo0FnxjLNQKU296dVkbVnQqk6i0A";

export const BUSINESS_TYPE_OPTIONS = [
  { value: "retail", label: "Supermarket / Grocery Retail" },
  { value: "fruits", label: "Fresh Fruits & Vegetables" },
  { value: "bakery", label: "Bakery & Dairy" },
  { value: "specialty", label: "Organic & Specialty Store" },
] as const;

export const STATE_OPTIONS = [
  "Kerala",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
] as const;

export const DISTRICT_OPTIONS = [
  "Kozhikode",
  "Ernakulam",
  "Thiruvananthapuram",
  "Malappuram",
] as const;

export const CITY_OPTIONS = ["Kozhikode", "Vadakara", "Koyilandy"] as const;
