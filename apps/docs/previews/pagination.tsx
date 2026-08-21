'use client'

import { Pagination, Stack, Text } from '@the_viveksingh/vivek-ui'
import { useState } from 'react'

export default function PaginationPreview({ name }: { name: string }) {
  const [page, setPage] = useState(4)

  if (name === 'firstLast') {
    return (
      <Pagination
        page={page}
        pageCount={12}
        onPageChange={setPage}
        showFirstLast
        siblingCount={2}
      />
    )
  }
  return (
    <Stack gap={3} align="center">
      <Pagination page={page} pageCount={12} onPageChange={setPage} />
      <Text size="sm" tone="muted">
        Page {page} of 12
      </Text>
    </Stack>
  )
}
