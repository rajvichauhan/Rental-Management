import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FiPackage, 
  FiClock, 
  FiShield, 
  FiTruck,
  FiStar,
  FiArrowRight
} from 'react-icons/fi';

const HomePage = () => {
  const features = [
    {
      icon: FiPackage,
      title: 'Wide Selection',
      description: 'Choose from thousands of high-quality rental items across multiple categories.'
    },
    {
      icon: FiClock,
      title: 'Flexible Rental Periods',
      description: 'Rent for hours, days, weeks, or months. We adapt to your schedule.'
    },
    {
      icon: FiShield,
      title: 'Insured & Protected',
      description: 'All rentals are fully insured and protected against damage or loss.'
    },
    {
      icon: FiTruck,
      title: 'Delivery & Pickup',
      description: 'Convenient delivery and pickup services available in your area.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Event Planner',
      content: 'RentEasy made organizing our corporate event so much easier. The equipment was top-notch and delivery was seamless.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Photographer',
      content: 'I regularly rent camera equipment for my shoots. The quality is always excellent and the pricing is very competitive.',
      rating: 5
    },
    {
      name: 'Lisa Rodriguez',
      role: 'Homeowner',
      content: 'Needed tools for a home renovation project. Much more cost-effective than buying everything outright.',
      rating: 5
    }
  ];

  return (
    <>
      <Helmet>
        <title>RentEasy - Your Premier Rental Management Solution</title>
        <meta name="description" content="Rent high-quality equipment and products with ease. From photography gear to tools and party supplies - we have everything you need." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Rent Everything You Need,
              <span className="block text-blue-200">When You Need It</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              From professional equipment to party supplies, discover thousands of high-quality rental items available at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100 inline-flex items-center"
              >
                Browse Products
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-blue-600"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RentEasy?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make renting simple, secure, and convenient for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-600">
              Explore our most popular rental categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Photography Equipment',
                image: '/images/categories/photography.jpg',
                description: 'Professional cameras, lenses, lighting, and accessories',
                itemCount: '150+ items'
              },
              {
                name: 'Audio/Video Equipment',
                image: '/images/categories/audio-video.jpg',
                description: 'Sound systems, microphones, projectors, and more',
                itemCount: '200+ items'
              },
              {
                name: 'Tools & Equipment',
                image: '/images/categories/tools.jpg',
                description: 'Power tools, construction equipment, and machinery',
                itemCount: '300+ items'
              },
              {
                name: 'Party Supplies',
                image: '/images/categories/party.jpg',
                description: 'Tables, chairs, decorations, and event equipment',
                itemCount: '100+ items'
              },
              {
                name: 'Sports Equipment',
                image: '/images/categories/sports.jpg',
                description: 'Outdoor gear, fitness equipment, and sports accessories',
                itemCount: '80+ items'
              },
              {
                name: 'Electronics',
                image: '/images/categories/electronics.jpg',
                description: 'Laptops, tablets, gaming consoles, and tech gadgets',
                itemCount: '120+ items'
              }
            ].map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${category.name}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">{category.name}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {category.description}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    {category.itemCount}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Renting?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust RentEasy for all their rental needs.
          </p>
          <Link
            to="/register"
            className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100 inline-flex items-center"
          >
            Create Your Account
            <FiArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
