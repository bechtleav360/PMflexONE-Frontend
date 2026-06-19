import { Pencil, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import {
  EditPortfolioDialog,
  useEditPortfolioDialogStore,
  usePortfolios,
} from '@/features/portfolios'
import type { Program } from '@/features/programs'
import {
  CreateProgramDialog,
  EditProgramDialog,
  ProgramList,
  useCreateProgramDialogStore,
  useEditProgramDialogStore,
  usePortfolioPrograms,
  useProgramListState,
} from '@/features/programs'
import { Button, ButtonIcon, Separator } from '@/shared/components'
import { CRUMB_SEP } from '@/shared/lib/constants'
import { PageContent } from '@/widgets/Layout'

type PageT = ReturnType<typeof useTranslation>['t']

/**
 * Renders the breadcrumb navigation for the portfolio detail page.
 * @param portfolioTitle - Localised label for the portfolios list link.
 * @param portfolioName - Name of the current portfolio shown as the active crumb.
 * @returns The breadcrumb navigation element.
 */
function renderPortfolioBreadcrumb(portfolioTitle: string, portfolioName: string) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <Link
        to="/portfolios"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        {portfolioTitle}
      </Link>
      <span
        className="text-muted-foreground"
        aria-hidden="true"
      >
        {CRUMB_SEP}
      </span>
      <span className="text-sm font-medium">{portfolioName}</span>
    </div>
  )
}

function renderPortfolioNotFound(t: PageT) {
  return (
    <PageContent>
      <div className="mb-6 flex items-center gap-2">
        <Link
          to="/portfolios"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          {t('pages.portfolios.title')}
        </Link>
      </div>
      <p className="mt-6 text-sm">{t('pages.portfolios.detail.notFound')}</p>
    </PageContent>
  )
}

function usePortfolioDetail() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { data: portfolios = [], isPending: portfoliosPending } = usePortfolios()
  const portfolio = portfolios.find((p) => p.id === id) ?? null
  const openEdit = useEditPortfolioDialogStore((s) => s.open)
  const openCreateProgram = useCreateProgramDialogStore((s) => s.open)
  const openEditProgram = useEditProgramDialogStore((s) => s.open)
  const {
    data: programs = [],
    isPending: programsPending,
    isError: programsError,
  } = usePortfolioPrograms(id ?? undefined)
  const { rows, sort, setSort } = useProgramListState(programs)
  return {
    t,
    locale: i18n.language,
    id,
    portfolio,
    portfoliosPending,
    openEdit,
    openCreateProgram,
    openEditProgram,
    programsPending,
    programsError,
    rows,
    sort,
    setSort,
  }
}

function renderPortfolioNavLinks(id: string, t: PageT) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/portfolios/${id}/risk-management`}>{t('pages.riskManagement.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/portfolios/${id}/issue-management`}>{t('pages.issueManagement.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/portfolios/${id}/problem-management`}>
          {t('pages.problemManagement.title')}
        </Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/portfolios/${id}/projectmember`}>{t('pages.projectMembers.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/portfolios/${id}/rasci`}>{t('pages.rasciMatrix.rightsButton')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/portfolios/${id}/goals`}>{t('pages.portfolioGoals.title')}</Link>
      </Button>
      <Button
        variant="outline"
        asChild
      >
        <Link to={`/portfolios/${id}/stakeholder-management`}>
          {t('pages.stakeholderManagement.title')}
        </Link>
      </Button>
    </div>
  )
}

function renderPortfolioProgramsSection(args: {
  t: PageT
  portfolioId: string
  rows: Program[]
  programsPending: boolean
  programsError: boolean
  sort: ReturnType<typeof useProgramListState>['sort']
  setSort: (v: ReturnType<typeof useProgramListState>['sort']) => void
  openCreateProgram: (id: string) => void
  openEditProgram: (program: Program) => void
}) {
  const {
    t,
    portfolioId,
    rows,
    programsPending,
    programsError,
    sort,
    setSort,
    openCreateProgram,
    openEditProgram,
  } = args
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('pages.portfolios.detail.programsSection')}</h2>
        <Button
          onClick={() => {
            openCreateProgram(portfolioId)
          }}
        >
          <ButtonIcon icon={Plus} />
          {t('pages.portfolios.detail.newProgram')}
        </Button>
      </div>
      <ProgramList
        portfolioId={portfolioId}
        rows={rows}
        isPending={programsPending}
        isError={programsError}
        sort={sort}
        onSortChange={setSort}
        onEdit={(program) => {
          openEditProgram(program)
        }}
      />
    </div>
  )
}

/**
 * Detail page for a single portfolio.
 *
 * Displays portfolio metadata and lazily loads the associated programs section
 * when the user clicks "Associated Programs". Hosts the create-program and
 * edit-program dialogs so they are mounted once for the entire page.
 *
 * @returns The rendered portfolio detail page.
 */
export function PortfolioDetailPage() {
  const {
    t,
    locale,
    id,
    portfolio,
    portfoliosPending,
    openEdit,
    openCreateProgram,
    openEditProgram,
    programsPending,
    programsError,
    rows,
    sort,
    setSort,
  } = usePortfolioDetail()

  if (portfoliosPending)
    return (
      <PageContent>
        <div className="text-muted-foreground text-sm">{t('shared.loading')}</div>
      </PageContent>
    )

  if (!portfolio) return renderPortfolioNotFound(t)

  return (
    <PageContent>
      {renderPortfolioBreadcrumb(t('pages.portfolios.title'), portfolio.name)}

      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            openEdit(portfolio)
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t('pages.portfolios.detail.edit')}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">{t('pages.portfolios.detail.startYear')}</span>
          <span>{portfolio.startYear ?? t('pages.portfolios.list.noYear')}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">{t('pages.portfolios.detail.endYear')}</span>
          <span>{portfolio.endYear ?? t('pages.portfolios.list.noYear')}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">{t('pages.portfolios.detail.createdAt')}</span>
          <span>{new Date(portfolio.createdAt).toLocaleDateString(locale)}</span>
        </div>
      </div>

      <Separator className="my-6" />

      {renderPortfolioNavLinks(id ?? '', t)}

      {renderPortfolioProgramsSection({
        t,
        portfolioId: portfolio.id,
        rows,
        programsPending,
        programsError,
        sort,
        setSort,
        openCreateProgram,
        openEditProgram,
      })}

      <EditPortfolioDialog />
      <CreateProgramDialog />
      <EditProgramDialog />
    </PageContent>
  )
}
