export const navigation = [
  { href: "/our-story", label: "Our Story" },
  { href: "/menus", label: "Menus" },
  { href: "/private-dining", label: "Private Dining" },
  { href: "/events", label: "Events" },
  { href: "/visit", label: "Visit" },
] as const;

export const restaurant = {
  name: "Marsh & Ember",
  descriptor: "lowcountry culinary fire",
  tagline:
    "Wood-fired cooking, seasonal ingredients, and warm Southern hospitality in the heart of Charleston.",
  addressLines: ["184 King Street", "Charleston, SC 29401"],
  address: "184 King Street, Charleston, SC 29401",
  phone: "843-555-0148",
  phoneHref: "tel:+18435550148",
  email: "hello@marshandember.com",
  hours: [
    { days: "Sunday–Thursday", time: "5:00 PM–10:00 PM" },
    { days: "Friday–Saturday", time: "5:00 PM–11:00 PM" },
  ],
} as const;

export type MenuItem = {
  name: string;
  price?: string;
  description: string;
  tags?: readonly string[];
};

export type MenuSection = {
  id: string;
  title: string;
  items: readonly MenuItem[];
};

export const dinnerSections: readonly MenuSection[] = [
  {
    id: "to-begin",
    title: "To Begin",
    items: [
      { name: "Hearth Bread", price: "$9", description: "Benne, cultured butter, smoked sea salt. Baked fresh over hickory wood coals daily.", tags: ["Hearth-Baked"] },
      { name: "Smoked Fish Dip", price: "$14", description: "Pickled vegetables, saltines, herbs." },
      { name: "Roasted Oysters", price: "$18", description: "Garlic, breadcrumbs, ember butter." },
      { name: "Country Ham", price: "$17", description: "Seasonal preserves, warm biscuits." },
    ],
  },
  {
    id: "vegetables",
    title: "Vegetables & Grains",
    items: [
      { name: "Charred Okra", price: "$16", description: "Field pea hummus, preserved lemon, sesame, extra virgin olive oil.", tags: ["VG", "GA"] },
      { name: "Ember-Roasted Carrots", price: "$15", description: "Sorghum, sunflower seed, herbs." },
      { name: "Carolina Gold Rice", price: "$14", description: "Mushrooms, scallion, smoked broth." },
      { name: "Summer Squash", price: "$15", description: "Tomato, benne, basil." },
    ],
  },
  {
    id: "hearth",
    title: "From the Hearth",
    items: [
      { name: "Market Fish", price: "MP", description: "Summer squash, shrimp broth, local garden herbs. Day-boat seafood cooked directly on the ash.", tags: ["GA"] },
      { name: "Ember-Roasted Chicken", price: "$34", description: "Carolina Gold rice, greens, natural jus." },
      { name: "Wood-Grilled Pork", price: "$38", description: "Field peas, mustard greens, peach mostarda." },
      { name: "Hearth-Roasted Beef", price: "$46", description: "Potatoes, onion, red wine jus." },
    ],
  },
  {
    id: "sides",
    title: "Sides",
    items: [
      { name: "Crispy Potatoes", price: "$10", description: "Smoked aioli, herbs." },
      { name: "Braised Greens", price: "$9", description: "Pepper vinegar." },
      { name: "Field Peas", price: "$10", description: "Tomato, herbs." },
    ],
  },
  {
    id: "dessert",
    title: "Dessert",
    items: [
      { name: "Cornmeal Cake", price: "$12", description: "Seasonal fruit, cultured cream.", tags: ["V"] },
      { name: "Chocolate Custard", price: "$13", description: "Benne brittle, sea salt." },
      { name: "Sorghum Ice Cream", price: "$10", description: "Pecan, oat crumble." },
    ],
  },
] as const;

export type EventRecord = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  time: string;
  format: string;
  status: string;
};

export const events: readonly EventRecord[] = [
  {
    slug: "harvest-at-the-hearth",
    title: "Harvest at the Hearth",
    summary: "A seasonal dinner centered on the hearth, late-summer produce, and a shared menu created for one evening.",
    date: "September 24, 2026",
    time: "6:30 PM",
    format: "Multi-course shared dinner",
    status: "RSVP Open",
  },
  {
    slug: "lowcountry-oyster-roast",
    title: "Lowcountry Oyster Roast",
    summary: "Oysters from the coast, food from the fire, cold drinks, and an afternoon designed for gathering.",
    date: "October 11, 2026 · 4–7 PM",
    time: "4–7 PM",
    format: "Courtyard gathering",
    status: "Upcoming",
  },
  {
    slug: "benne-and-bourbon",
    title: "Benne & Bourbon",
    summary: "An evening exploring benne, bourbon, and the ways each can shape a menu from first course to dessert.",
    date: "November 5, 2026 · 6:30 PM",
    time: "6:30 PM",
    format: "Guided dinner",
    status: "Limited Availability",
  },
  {
    slug: "sunday-supper",
    title: "Sunday Supper",
    summary: "A relaxed Sunday supper built around a seasonal family-style menu and a communal table.",
    date: "November 22, 2026 · 5 PM",
    time: "5 PM",
    format: "Shared-table dinner",
    status: "Upcoming",
  },
] as const;

export function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}

export const dietaryMarkers = [
  { code: "VG", label: "Vegan", detail: "No animal products utilized." },
  { code: "V", label: "Vegetarian", detail: "Made with dairy, eggs, and plants." },
  { code: "GA", label: "Gluten-aware", detail: "Prepared without gluten ingredients; trace contamination is possible." },
] as const;
