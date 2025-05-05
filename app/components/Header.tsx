interface HeaderProps {
  title: string
  subtitle?: string
}

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export default Header 