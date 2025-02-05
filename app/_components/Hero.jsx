import React from 'react'

const Hero = () => {
  return (
    <section className="bg-gray-50">
  <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen ">
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-extrabold sm:text-5xl">
        Create your form.
        <strong className="font-extrabold text-primary sm:block"> In seconds not hours. </strong>
      </h1>

      <p className="mt-4 sm:text-xl/relaxed text-gray-500">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nesciunt illo tenetur fuga ducimus
        numquam ea!
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          className="block w-full rounded-sm bg-primary px-12 py-3 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:ring-3 focus:outline-hidden sm:w-auto"
          href="#"
        >
          + Create AI Form
        </a>

        <a
          className="block w-full rounded-sm px-12 py-3 text-sm font-medium text-primary shadow-sm hover:text-purple-700 focus:ring-3 focus:outline-hidden sm:w-auto"
          href="#"
        >
          Learn More
        </a>
      </div>
    </div>
  </div>
</section>
  )
}

export default Hero