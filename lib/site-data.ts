import type { EventRecord } from "./events";

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
  mapUrl: "https://maps.google.com/?q=184+King+Street+Charleston+SC+29401",
  phone: "843-555-0148",
  phoneHref: "tel:+18435550148",
  email: "hello@marshandember.com",
  eventEmail: "events@marshandember.com",
  eventPhone: "(843) 555-0100",
  eventPhoneHref: "tel:+18435550100",
  privateDiningEmail: "events@marshandember.com",
  privateDiningPhone: "(843) 555-0180",
  privateDiningPhoneHref: "tel:+18435550180",
  instagramUrl: "https://instagram.com",
  facebookUrl: "https://facebook.com",
  announcement: {
    message: "Reservations are now open — reserve your table online.",
    linkLabel: "Book now",
    linkPath: "/visit#contact",
    dismissalVersion: "1",
  },
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
  featuredOnLanding?: boolean;
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
      { name: "Hearth Bread", price: "$9", description: "Benne, cultured butter, smoked sea salt. Baked fresh over hickory wood coals daily.", tags: ["Hearth-Baked"], featuredOnLanding: true },
      { name: "Smoked Fish Dip", price: "$14", description: "Pickled vegetables, saltines, herbs." },
      { name: "Roasted Oysters", price: "$18", description: "Garlic, breadcrumbs, ember butter." },
      { name: "Country Ham", price: "$17", description: "Seasonal preserves, warm biscuits." },
    ],
  },
  {
    id: "vegetables",
    title: "Vegetables & Grains",
    items: [
      { name: "Charred Okra", price: "$16", description: "Field pea hummus, preserved lemon, sesame, extra virgin olive oil.", tags: ["VG", "GA"], featuredOnLanding: true },
      { name: "Ember-Roasted Carrots", price: "$15", description: "Sorghum, sunflower seed, herbs." },
      { name: "Carolina Gold Rice", price: "$14", description: "Mushrooms, scallion, smoked broth." },
      { name: "Summer Squash", price: "$15", description: "Tomato, benne, basil." },
    ],
  },
  {
    id: "hearth",
    title: "From the Hearth",
    items: [
      { name: "Market Fish", price: "MP", description: "Summer squash, shrimp broth, local garden herbs. Day-boat seafood cooked directly on the ash.", tags: ["GA"], featuredOnLanding: true },
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

export const events: readonly EventRecord[] = [
  {
    slug: "harvest-at-the-hearth",
    title: "Harvest at the Hearth",
    summary: "A seasonal dinner centered on the hearth, late-summer produce, and a shared menu created for one evening.",
    listingImage: { src: "/images/events-harvest-dinner-image.jpg", alt: "Harvest at the Hearth seasonal dinner" },
    startsAt: "2026-09-24T22:30:00Z",
    endsAt: "2026-09-25T01:00:00Z",
    date: "September 24, 2026",
    time: "6:30 PM",
    schedule: "September 24, 2026 · 6:30 PM – Approximately 9 PM · Marsh & Ember, Charleston, South Carolina",
    location: "Marsh & Ember, Charleston",
    format: "Multi-course shared dinner",
    availability: { state: "accepting", label: "RSVP Open" },
    detail: {
      heroImage: "/images/event-primary-harvest-dinner.jpg",
      heroAlt: "Harvest at the Hearth dinner served around a shared table",
      availabilityNote: "Limited seats available",
      facts: [
        { label: "Date", value: "September 24, 2026" },
        { label: "Time", value: "6:30 PM – Approximately 9 PM" },
        { label: "Time Zone", value: "Eastern Time" },
        { label: "Format", value: "Multi-course shared dinner" },
        { label: "Location", value: "Marsh & Ember, Charleston" },
        { label: "Registration", value: "RSVP required" },
      ],
      intro: {
        title: "An evening around the hearth",
        paragraphs: [
          "Harvest at the Hearth is a one-night dinner inspired by the transition from late summer into fall. The menu follows ingredients through the fire—from vegetables and seafood to grains, smoke, and the final course.",
          "Guests will be seated for a shared multi-course experience. The evening is designed to unfold as one menu, with beverages available separately unless otherwise noted during confirmation.",
        ],
        images: [
          { src: "/images/event-food-prep-image.jpg", alt: "Seasonal ingredients being prepared for the event" },
          { src: "/images/event-dining-room-setup.jpg", alt: "The dining room prepared for Harvest at the Hearth" },
        ],
      },
      expectations: [
        { title: "Shared multi-course menu", copy: "The kitchen will serve one seasonal menu across the evening." },
        { title: "Communal experience", copy: "Seating may include shared tables or neighboring parties depending on the final event format." },
        { title: "Set arrival time", copy: "Guests should plan to arrive before the 6:30 PM start so the menu can begin together." },
        { title: "Dietary communication", copy: "Share dietary needs in the RSVP request. The team will review requests before confirming attendance, but not every accommodation can be guaranteed." },
      ],
      courses: [
        { name: "Hearth Bread", description: "Benne, cultured butter, smoked sea salt" },
        { name: "Ember-Roasted Vegetables", description: "Field peas, herbs, preserved lemon", tags: ["VG", "GA"] },
        { name: "Market Fish", description: "Carolina Gold rice, shrimp broth, seasonal vegetables" },
        { name: "Wood-Grilled Pork", description: "Mustard greens, peach, natural jus" },
        { name: "Cornmeal Cake", description: "Late-summer fruit, cultured cream", tags: ["V"] },
      ],
    },
  },
  {
    slug: "lowcountry-oyster-roast",
    title: "Lowcountry Oyster Roast",
    summary: "Oysters from the coast, food from the fire, cold drinks, and an afternoon designed for gathering.",
    listingImage: { src: "/images/events-oyster-roast-image.jpg", alt: "Oysters roasting over the fire at a Lowcountry gathering" },
    startsAt: "2026-10-11T20:00:00Z",
    endsAt: "2026-10-11T23:00:00Z",
    date: "October 11, 2026",
    time: "4–7 PM",
    schedule: "October 11, 2026 · 4–7 PM · Marsh & Ember, Charleston, South Carolina",
    location: "Marsh & Ember, Charleston",
    format: "Courtyard gathering",
    availability: { state: "accepting", label: "RSVP Open" },
  },
  {
    slug: "benne-and-bourbon",
    title: "Benne & Bourbon",
    summary: "An evening exploring benne, bourbon, and the ways each can shape a menu from first course to dessert.",
    listingImage: { src: "/images/events-benne-bourbon-image.jpg", alt: "Benne and bourbon prepared for a guided dinner" },
    startsAt: "2026-11-05T23:30:00Z",
    endsAt: "2026-11-06T02:00:00Z",
    date: "November 5, 2026",
    time: "6:30 PM",
    schedule: "November 5, 2026 · 6:30 PM · Marsh & Ember, Charleston, South Carolina",
    location: "Marsh & Ember, Charleston",
    format: "Guided dinner",
    availability: { state: "accepting", label: "Limited Availability" },
  },
  {
    slug: "sunday-supper",
    title: "Sunday Supper",
    summary: "A relaxed Sunday supper built around a seasonal family-style menu and a communal table.",
    listingImage: { src: "/images/events-sunday-supper-image.jpg", alt: "A seasonal shared-table Sunday supper" },
    startsAt: "2026-11-22T22:00:00Z",
    endsAt: "2026-11-23T01:00:00Z",
    date: "November 22, 2026",
    time: "5 PM",
    schedule: "November 22, 2026 · 5 PM · Marsh & Ember, Charleston, South Carolina",
    location: "Marsh & Ember, Charleston",
    format: "Shared-table dinner",
    availability: { state: "accepting", label: "RSVP Open" },
  },
];

export const dietaryMarkers = [
  { code: "VG", label: "Vegan", detail: "No animal products utilized." },
  { code: "V", label: "Vegetarian", detail: "Made with dairy, eggs, and plants." },
  { code: "GA", label: "Gluten-aware", detail: "Prepared without gluten ingredients; trace contamination is possible." },
] as const;
