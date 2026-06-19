import { businessCaseHandlers } from './businessCase'
import { deliverablesHandlers } from './deliverables'
import { planningObjectsHandlers } from './planningObjects'
import { portfolioHandlers } from './portfolio'
import { programHandlers } from './program'
import { projectHandlers } from './project'
import { projectCharterHandlers } from './projectCharter'
import { projectInitiationRequestHandlers } from './projectInitiationRequest'
import { rasciMatrixHandlers } from './rasciMatrix'
import { riskRegisterHandlers } from './riskRegister'
import { stakeholderHandlers } from './stakeholder'
import { workItemHandlers } from './workItem'

/** MSW request handlers shared by both the browser worker and the Vitest server. */
export const handlers = [
  ...projectHandlers,
  ...portfolioHandlers,
  ...programHandlers,
  ...projectInitiationRequestHandlers,
  ...businessCaseHandlers,
  ...projectCharterHandlers,
  ...riskRegisterHandlers,
  ...stakeholderHandlers,
  ...workItemHandlers,
  ...rasciMatrixHandlers,
  ...deliverablesHandlers,
  ...planningObjectsHandlers,
]
