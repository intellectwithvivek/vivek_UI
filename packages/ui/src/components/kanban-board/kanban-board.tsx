'use client'

import {
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react'
import { useIsomorphicId } from '../../hooks/use-isomorphic-id'
import { cx } from '../../utils/cx'

export interface KanbanCard {
  id: string
  title: string
  description?: string
  /** Rendered top-right — a priority, an estimate, an avatar. */
  badge?: ReactNode
  meta?: unknown
}

export interface KanbanColumn {
  id: string
  title: string
  cards: KanbanCard[]
  /** Work-in-progress limit. Shown in the header, and blocks drops when reached. */
  limit?: number
}

export interface KanbanMove {
  cardId: string
  fromColumnId: string
  toColumnId: string
  /** Index within the destination column. */
  toIndex: number
}

export interface KanbanBoardProps {
  columns: readonly KanbanColumn[]
  /** Required. A board with no accessible name is one more unlabelled region. */
  label: string
  /** Nothing is moved for you — apply this to your own state. */
  onMove?: (move: KanbanMove) => void
  /** Rendered instead of the default card body. */
  renderCard?: (card: KanbanCard, column: KanbanColumn) => ReactNode
  className?: string
}

interface Grabbed {
  cardId: string
  fromColumnId: string
  columnIndex: number
  cardIndex: number
}

/**
 * A Kanban board that a keyboard can actually use.
 *
 * Nearly every Kanban implementation is mouse-only, and the reason is structural rather than
 * lazy: the HTML5 drag-and-drop API has **no keyboard equivalent at all**. `draggable` and
 * `dragstart` fire for pointers and nothing else. A board built on it is unusable for anyone
 * who cannot drag, which includes keyboard users, screen-reader users, and anyone with a
 * motor impairment — and adding `tabindex` does not help, because there is no key that
 * initiates a drag.
 *
 * So there are two complete input paths here, not one:
 *
 * **Pointer** — ordinary HTML5 drag and drop.
 *
 * **Keyboard** — a pick-up / move / drop model, which is what the WAI-ARIA authoring
 * practices recommend in place of dragging:
 *
 * | Key | Behaviour |
 * | --- | --- |
 * | Space or Enter | Pick the card up, or drop it |
 * | Left / Right | Move the held card to the previous / next column |
 * | Up / Down | Move it within the column |
 * | Escape | Cancel and return it to where it started |
 *
 * Every step is announced through an `aria-live` region — "Moved to In progress, position 2
 * of 4" — because a silent move is indistinguishable from nothing happening.
 *
 * **Nothing is mutated for you.** `onMove` reports the intended move and your state decides,
 * which is the only shape that works with an optimistic update that might be rejected.
 */
export function KanbanBoard({ columns, label, onMove, renderCard, className }: KanbanBoardProps) {
  const [grabbed, setGrabbed] = useState<Grabbed | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const boardRef = useRef<HTMLDivElement | null>(null)
  // Card ids come from the caller's data, so two boards on one page - or two boards in a
  // docs example - would emit the same `id` twice and every duplicate description would
  // resolve to whichever element the browser found first.
  const baseId = useIsomorphicId()

  const find = useCallback(
    (cardId: string) => {
      for (let c = 0; c < columns.length; c++) {
        const column = columns[c]
        if (!column) continue
        const index = column.cards.findIndex((card) => card.id === cardId)
        if (index !== -1) return { column, columnIndex: c, cardIndex: index }
      }
      return null
    },
    [columns],
  )

  /** Focus a card after a move, so the keyboard user stays on the thing they are holding. */
  const refocus = useCallback((cardId: string) => {
    requestAnimationFrame(() => {
      boardRef.current
        ?.querySelector<HTMLElement>(`[data-card-id="${CSS.escape(cardId)}"]`)
        ?.focus()
    })
  }, [])

  const commit = useCallback(
    (move: KanbanMove, spoken: string) => {
      onMove?.(move)
      setAnnouncement(spoken)
      refocus(move.cardId)
    },
    [onMove, refocus],
  )

  const isFull = (column: KanbanColumn, incoming: boolean) =>
    typeof column.limit === 'number' && incoming && column.cards.length >= column.limit

  // --- pointer ---------------------------------------------------------------------

  const onDragStart = (event: ReactDragEvent, cardId: string, fromColumnId: string) => {
    event.dataTransfer.effectAllowed = 'move'
    // Data is set as well as held in state: without it Firefox refuses to start the drag.
    event.dataTransfer.setData('text/plain', cardId)
    const located = find(cardId)
    if (!located) return
    setGrabbed({
      cardId,
      fromColumnId,
      columnIndex: located.columnIndex,
      cardIndex: located.cardIndex,
    })
  }

  const onDrop = (event: ReactDragEvent, column: KanbanColumn) => {
    event.preventDefault()
    setDragOver(null)
    const cardId = event.dataTransfer.getData('text/plain') || grabbed?.cardId
    if (!cardId) return
    const located = find(cardId)
    if (!located || located.column.id === column.id) {
      setGrabbed(null)
      return
    }
    if (isFull(column, true)) {
      setAnnouncement(`${column.title} is at its limit of ${column.limit}.`)
      setGrabbed(null)
      return
    }
    commit(
      {
        cardId,
        fromColumnId: located.column.id,
        toColumnId: column.id,
        toIndex: column.cards.length,
      },
      `Moved to ${column.title}, position ${column.cards.length + 1} of ${column.cards.length + 1}.`,
    )
    setGrabbed(null)
  }

  // --- keyboard --------------------------------------------------------------------

  const onCardKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
    card: KanbanCard,
    column: KanbanColumn,
    columnIndex: number,
    cardIndex: number,
  ) => {
    const holding = grabbed?.cardId === card.id

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (holding) {
        setGrabbed(null)
        setAnnouncement(`Dropped ${card.title} in ${column.title}.`)
      } else {
        setGrabbed({ cardId: card.id, fromColumnId: column.id, columnIndex, cardIndex })
        setAnnouncement(
          `Picked up ${card.title}. In ${column.title}, position ${cardIndex + 1} of ${column.cards.length}. Use the arrow keys to move it, Enter to drop, Escape to cancel.`,
        )
      }
      return
    }

    if (event.key === 'Escape' && holding) {
      event.preventDefault()
      setGrabbed(null)
      setAnnouncement(`Cancelled. ${card.title} stayed in ${column.title}.`)
      return
    }

    if (!holding) return

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const target = columns[columnIndex + (event.key === 'ArrowRight' ? 1 : -1)]
      if (!target) return
      if (isFull(target, true)) {
        setAnnouncement(`${target.title} is at its limit of ${target.limit}.`)
        return
      }
      const toIndex = target.cards.length
      commit(
        { cardId: card.id, fromColumnId: column.id, toColumnId: target.id, toIndex },
        `Moved to ${target.title}, position ${toIndex + 1} of ${toIndex + 1}.`,
      )
      return
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const toIndex = cardIndex + (event.key === 'ArrowDown' ? 1 : -1)
      if (toIndex < 0 || toIndex >= column.cards.length) return
      commit(
        { cardId: card.id, fromColumnId: column.id, toColumnId: column.id, toIndex },
        `Moved to position ${toIndex + 1} of ${column.cards.length} in ${column.title}.`,
      )
    }
  }

  return (
    <div aria-label={label} className={cx('vk-kanban', className)} ref={boardRef} role="group">
      {/*
        Always mounted. A live region created at the same moment it gains text is frequently
        never announced - the screen reader has to already be observing the node.
      */}
      <div aria-live="polite" className="vk-visually-hidden" role="status">
        {announcement}
      </div>

      <div className="vk-kanban__columns">
        {columns.map((column, columnIndex) => {
          const full = typeof column.limit === 'number' && column.cards.length >= column.limit
          return (
            <section
              aria-label={`${column.title}, ${column.cards.length} cards`}
              className="vk-kanban__column"
              data-drag-over={dragOver === column.id || undefined}
              data-full={full || undefined}
              key={column.id}
              onDragLeave={() => setDragOver((id) => (id === column.id ? null : id))}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                setDragOver(column.id)
              }}
              onDrop={(event) => onDrop(event, column)}
            >
              <header className="vk-kanban__column-head">
                <span className="vk-kanban__column-title">{column.title}</span>
                <span className="vk-kanban__count">
                  {column.cards.length}
                  {typeof column.limit === 'number' ? ` / ${column.limit}` : null}
                </span>
              </header>

              {/* biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics from a list-style:none list; the role restores them. */}
              <ul className="vk-kanban__list" role="list">
                {column.cards.map((card, cardIndex) => {
                  const holding = grabbed?.cardId === card.id
                  return (
                    <li className="vk-kanban__item" key={card.id}>
                      <article
                        aria-describedby={`${baseId}-${card.id}-hint`}
                        className="vk-kanban__card"
                        data-grabbed={holding || undefined}
                        data-card-id={card.id}
                        draggable
                        onDragEnd={() => {
                          setGrabbed(null)
                          setDragOver(null)
                        }}
                        onDragStart={(event) => onDragStart(event, card.id, column.id)}
                        onKeyDown={(event) =>
                          onCardKeyDown(event, card, column, columnIndex, cardIndex)
                        }
                        // biome-ignore lint/a11y/noNoninteractiveTabindex: the card is the drag source and the keyboard pick-up target; role="button" would flatten the title/description structure it needs.
                        tabIndex={0}
                      >
                        {renderCard ? (
                          renderCard(card, column)
                        ) : (
                          <>
                            <div className="vk-kanban__card-head">
                              <span className="vk-kanban__card-title">{card.title}</span>
                              {card.badge ? (
                                <span className="vk-kanban__card-badge">{card.badge}</span>
                              ) : null}
                            </div>
                            {card.description ? (
                              <p className="vk-kanban__card-description">{card.description}</p>
                            ) : null}
                          </>
                        )}
                        {/*
                          The instruction lives on the card, not in a legend somewhere: a
                          screen-reader user reaching a draggable card has no way to discover
                          that Space picks it up unless they are told at that moment.
                        */}
                        <span className="vk-visually-hidden" id={`${baseId}-${card.id}-hint`}>
                          {holding
                            ? 'Held. Arrow keys move it, Enter drops, Escape cancels.'
                            : 'Press Enter or Space to pick this card up.'}
                        </span>
                      </article>
                    </li>
                  )
                })}

                {column.cards.length === 0 ? (
                  <li className="vk-kanban__empty">Nothing here yet</li>
                ) : null}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
