import {dietaryMarker} from './dietaryMarker'
import {event} from './event'
import {menu} from './menu'
import {address, editorialImage, eventCourse, eventExpectation, eventFact, menuItem, menuSection, serviceHours} from './objects/shared'
import {siteSettings} from './siteSettings'

export const schemaTypes = [
  siteSettings,
  menu,
  event,
  dietaryMarker,
  address,
  serviceHours,
  editorialImage,
  menuSection,
  menuItem,
  eventFact,
  eventExpectation,
  eventCourse,
]
