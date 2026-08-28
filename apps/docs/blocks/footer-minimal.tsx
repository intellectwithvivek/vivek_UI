import { Footer } from '@the_viveksingh/vivek-ui'

export default function FooterMinimal() {
  return (
    <Footer
      padding="sm"
      brand="Ledger"
      columns={[
        {
          title: 'Links',
          links: [
            { label: 'Privacy', href: '#' },
            { label: 'Terms', href: '#' },
            { label: 'Status', href: '#' },
          ],
        },
      ]}
      copyright="© 2026 Ledger Ltd."
    />
  )
}
