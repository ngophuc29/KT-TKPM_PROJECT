import React, { useState } from 'react'
import ProductDetailsHead from './ProductDetailsHead'
import ProductAbout from './ProductAbout'
import ProductDetails from './ProductDetails'
import ProductSpecs from './ProductSpecs'
import OutplayCompetition from './OutplayCompetition'
import ImageDisplay from './ImageDisplay'
import Features from '../../pages/Home/Features'
import FeaturesDetails from './FeaturesDetails'

const ProductDetailsAll = () => {
  const [activeTab, setActiveTab] = useState("about"); // "about", "details", "specs"

  return (
    <>
      {/* Truyền activeTab và setActiveTab xuống ProductDetailsHead */}
      <ProductDetailsHead activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "about" && <ProductAbout />}
      {activeTab === "details" && <ProductDetails />}
      {activeTab === "specs" && <ProductSpecs />}
      <OutplayCompetition />
      <ImageDisplay />
      <FeaturesDetails />
      <Features />
    </>
  )
}

export default ProductDetailsAll
