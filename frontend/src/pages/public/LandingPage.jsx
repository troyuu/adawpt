import { Link } from 'react-router'
import {
  PawPrint,
  Heart,
  Users,
  HandHeart,
  ArrowRight,
  Search,
  Stethoscope,
  Home,
  Megaphone,
  MapPin,
  Calendar,
} from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import AnimalCard from '../../components/animals/AnimalCard.jsx'
import useApi from '../../hooks/useApi.js'

function formatPeso(amount) {
  if (!amount || amount === 0) return '\u20B10'
  if (amount >= 1000000) return `\u20B1${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `\u20B1${(amount / 1000).toFixed(0)}K`
  return `\u20B1${amount.toLocaleString()}`
}

const steps = [
  {
    number: 1,
    title: 'Report',
    description: 'Spot a stray animal? Submit a quick report with location and photos so we can respond fast.',
    icon: Megaphone,
  },
  {
    number: 2,
    title: 'Rescue',
    description: 'Our trained volunteer team heads to the location to safely bring the animal to our shelter.',
    icon: MapPin,
  },
  {
    number: 3,
    title: 'Rehabilitate',
    description: 'Each animal receives medical care, vaccinations, and all the love they need to recover.',
    icon: Stethoscope,
  },
  {
    number: 4,
    title: 'Rehome',
    description: 'We carefully match rehabilitated animals with loving families ready to give them a forever home.',
    icon: Home,
  },
]


export default function LandingPage() {
  const { data: statsData } = useApi('/api/v1/dashboard/public-stats/')
  const { data: animalsData } = useApi('/api/v1/animals/?status=available&page_size=4')
  const { data: storiesData } = useApi('/api/v1/content/stories/?page_size=3')

  const s = statsData?.data
  const stats = [
    { label: 'Animals Rescued', value: s?.animals_rescued ?? '--', icon: PawPrint, color: 'text-primary', bg: 'bg-gradient-to-br from-primary/10 to-orange-50 border-primary/10' },
    { label: 'Successfully Adopted', value: s?.adopted ?? '--', icon: Heart, color: 'text-danger', bg: 'bg-gradient-to-br from-danger/10 to-red-50 border-danger/10' },
    { label: 'Registered Users', value: s?.registered_users ?? '--', icon: Users, color: 'text-secondary', bg: 'bg-gradient-to-br from-secondary/10 to-teal-50 border-secondary/10' },
    { label: 'Donated', value: s ? formatPeso(s.total_donated) : '--', icon: HandHeart, color: 'text-accent', bg: 'bg-gradient-to-br from-accent/10 to-purple-50 border-accent/10' },
  ]

  const featuredAnimals = animalsData?.data?.results || animalsData?.results || []
  const successStories = storiesData?.data?.results || storiesData?.results || []

  return (
    <div className="min-h-screen">
      {/* ---- Hero ---- */}
      <section className="bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
          <Badge variant="primary" className="mb-4">
            <PawPrint className="h-3.5 w-3.5 mr-1" />
            Adopt. Donate. Volunteer.
          </Badge>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Give a Stray a<br />
            <span className="text-primary">Second Chance</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Adawpt connects caring communities with stray animals in need. Report strays, adopt
            rescued pets, or support our mission to give every animal a loving home.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/report">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                <Megaphone className="h-5 w-5" />
                Report a Stray
              </Button>
            </Link>
            <Link to="/animals">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Search className="h-5 w-5" />
                Adopt Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Stats Bar ---- */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center py-6">
              <div className={`h-14 w-14 mx-auto mb-3 rounded-2xl border flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
              </div>
              <p className="font-display text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---- Featured Animals ---- */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            Looking for a Home
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            These adorable animals are waiting for someone like you. Could you be their new family?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAnimals.length > 0 ? featuredAnimals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          )) : (
            <p className="text-gray-500 col-span-full text-center py-8">No animals available yet. Check back soon!</p>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link to="/animals">
            <Button variant="outline" size="lg">
              View All Animals
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              From report to rehome, here is how we save and transform animal lives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="relative inline-flex items-center justify-center mb-5">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-orange-50 border border-primary/10 flex items-center justify-center">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Success Stories Preview ---- */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            Success Stories
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Every adoption is a happy ending. Here are some of our favorites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.length > 0 ? successStories.map((story) => (
            <Link key={story.id} to={`/stories/${story.slug}`} className="group">
              <Card hoverable className="flex flex-col h-full">
                <div className="aspect-[16/10] -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl relative">
                  {story.featured_image ? (
                    <img src={story.featured_image} alt={story.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center">
                      <Heart className="h-12 w-12 text-secondary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">{story.published_at || story.created_at}</span>
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{story.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{story.excerpt || story.body?.substring(0, 120)}</p>
                <span className="mt-4 text-sm font-medium text-primary hover:text-primary-hover inline-flex items-center gap-1">
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Card>
            </Link>
          )) : (
            <p className="text-gray-500 col-span-full text-center py-8">No stories yet. Check back soon!</p>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link to="/stories">
            <Button variant="outline">
              View All Stories
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Join Our Community
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Whether you want to adopt, volunteer, or donate, every action makes a difference.
            Create an account and start making an impact today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="outline" className="bg-white !text-primary !border-white hover:bg-gray-100 w-full sm:w-auto">
                Create an Account
              </Button>
            </Link>
            <Link to="/donate">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                <Heart className="h-5 w-5" />
                Donate Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
