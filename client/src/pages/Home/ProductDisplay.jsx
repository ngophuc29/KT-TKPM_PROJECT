import ProductSection from "../../components/ProductDisplay/ProductSection";
import BrandSection from "../../components/ProductDisplay/BrandSection";
import InstagramPost from "../../components/ProductDisplay/InstagramPost";

import IMAGES from "../../constants/images";
import TestimonialCard from "../../components/ProductDisplay/TestimonialCard";
import ProductFeatures from "../../components/ProductDisplay/ProductFeatures";
import Icon from "../../constants/icons";

const ProductDisplay = () => {
  const newProducts = [
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/6110020049c709a850ef149e9595b5ea1e2201fe45de8e5923d13bf56d6cb079?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: false,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/3efd8012a7b2c942d479de532c7895977a5481b40d8da289f3e36e2ce3fe7ac8?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/395f982e7d6cca20d747dfe0927d442d6de2c1493f96955533d7689e0cc41386?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/96fa115c1944ab3fb8d3ee946d81dc0e1da2458d10897f3ccce15543339ab3d9?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/395f982e7d6cca20d747dfe0927d442d6de2c1493f96955533d7689e0cc41386?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/395f982e7d6cca20d747dfe0927d442d6de2c1493f96955533d7689e0cc41386?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
  ];

  const customBuilds = [
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/6ac4ccf2c8bda179a5f811509bfee7ac7e1100794b861cdfbe6d9f4c0c6feffe?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/c793bf4b2ce4b138c2be2e514ec99a396f01f804eeb3bb898270ec1ac70ef966?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/728b57bdb4d8d205acb713e84a562629a535ddcd36eb1fafafbc8a2e02d8a619?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b60fbc0d603c043600d5e7d2720602260d15679a22a1de5b02551b88785a0179?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/e0438cedc992409f831859af09f5153401c9a3ec41fefb96a1c89e566d110fcc?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
  ];

  const desktops = [
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/c4144ade423bd24171ac7e891992c314ef1ce1b0917a5c7f776c3738df12d391?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/f85384aed2666c5455835cc2d8ec2f2434ab73fb5b896dcfaa07ce479d99f090?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/5e97a3813105017fd90e08ba1a6a9574c3220c105e4f42ba14d0dd27d4f538a2?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/5e97a3813105017fd90e08ba1a6a9574c3220c105e4f42ba14d0dd27d4f538a2?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/5e97a3813105017fd90e08ba1a6a9574c3220c105e4f42ba14d0dd27d4f538a2?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
  ];

  const gamingMonitors = [
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/29884c706ecef3e4aae22e3a5268221c96093c6934a81ef50fcb130d9c0b5e73?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/248f4c6d6e2bc1c54722556155e0d474c082c74d96055ca2f64fb3c1d170244b?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/53a890b932fb67765aa65398039cbfa6103337544344a742dddb3c3eec32e852?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a6d7f667505b8ad341b47ba091192b0c7e0dd5129e648c1a233b688da7938c24?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
    {
      inStock: true,
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/248f4c6d6e2bc1c54722556155e0d474c082c74d96055ca2f64fb3c1d170244b?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      rating: 4,
      description: "EX DISPLAY : MSI Pro 16 Flex-036AU 15.6 MULTITOUCH All-In-On...",
      originalPrice: "499.00",
      discountedPrice: "499.00",
    },
  ];

  const brands = [
    {
      name: "Brand 1",
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/4550bfd59ea500c94b53488668c7c80dff9a2de1b35e2721df12078b27f31654?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 2",
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/3178b34457ad8dbb2cdee5401c65dd0a8b8b93d6bca19ee01ff7f0aae71cb42c?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 3",
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/946453356046c72cd334fb6684109ce3536b1c817f62276859e1aedd4d690d8b?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 4",
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/3ea0ad5cf0eff01115834e885501112678ce8af6fd1c0169007a95ce9f2b2b07?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 5",
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/eb34dc0dccf1ef33016ec7180754b561151dbd4e5905da16f4ee7e2a746b1bcd?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 6",
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/8efdf94b756e9b2307230c83bd8988b0cf1d0a4d9a3e1d22f7548d16e8dadaff?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
    {
      name: "Brand 7",
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/871386c9064378fc338e3e01b0260380b22edeff743d3cd7480fd93cad871e74?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
    },
  ];

  const instagramPosts = [
    {
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/573d60164598ebab9e27c418a2b7e612df4dc1ce037baef65b4fbfbd53bc28af?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace...",
      date: "01.09.2020",
    },
    {
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/91a56f4345ff8ee8eb546812b301f5ab875f23c355a34ebf5d7007adccd3dc98?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "As a gamer, superior sound counts for a lot. You need to hear enemies tiptoeing up behind you for a sneak attack or a slight change in the atmospheric music signaling a new challenge or task...",
      date: "01.09.2020",
    },
    {
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/c5af4c67c9bcfd95ed31afc5dc971e08f666ab6e58aad2619fe77306228b53dc?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace...",
      date: "01.09.2020",
    },
    {
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/73c7f04c6d996812739c4bce20629f1455ab23806bf8cf004812a4b1cafd1ef3?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace...",
      date: "01.09.2020",
    },
    {
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/2906bf4ac6bbf94be676aec7494f4a39591adca6608e1b659bcd8ef7455cd4f3?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace...",
      date: "01.09.2020",
    },
    {
      imageSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/63a0f1854e83debf6d6c4daec08ca68088ab8593e65b8ed17b717564258b6281?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a",
      content:
        "If you've recently made a desktop PC or laptop purchase, you might want to consider adding peripherals to enhance your home office setup, your gaming rig, or your business workspace...",
      date: "01.09.2020",
    },
  ];

  return (
    <div className="container-fluid bg-light py-5">
      <div className="container">
        <img src={IMAGES.Banner} alt="banner" className="w-100" />
      </div>

      <ProductSection title="New Products" products={newProducts} seeAllLink="See All New Products" />

      <div className="container my-5 py-4 text-white" style={{ backgroundColor: "#F5F7FF" }}>
        <div className="d-flex align-items-center justify-content-center ">
          <div className="">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f019d2b4deba5b25bd92c936b8cd677ae76df6639dac225c64ba2315991fa94d?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
              alt="Icon"
              className="img-fluid"
            />
          </div>
          <div className="mx-3">
            <div className="vr h-100" style={{ background: "#00AEB8", width: "1px" }}></div>
          </div>
          <div className="">
            <p className="mb-0" style={{ color: "#272560" }}>
              <span className="fw-bold">Own</span> it now, up to 6 months interest free{" "}
              <a href="#" className="text-decoration-underline" style={{ color: "#272560" }}>
                learn more
              </a>
            </p>
          </div>
        </div>
      </div>

      <ProductSection
        title="Custom Builds"
        products={customBuilds}
        seeAllLink="See All Products"
        brandImage="https://cdn.builder.io/api/v1/image/assets/TEMP/d5ca1418446505730363d7a68545e24fdc05a9f2449f0968f6df7cc49149a823?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
      />

      <div className="container my-5">
        <div className="row ">
          <div className="col-auto">
            <div className="d-flex flex-column align-items-center">
              <span>MSI GS Series</span>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/07d0ccfc53c806d775db0bc48600cf9a29ef6a464ed854b2abc7786995d30839?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
                alt="MSI GS Series"
                className="img-fluid"
              />
            </div>
          </div>
          <div className="col-auto">
            <span>MSI GT Series</span>
          </div>
          <div className="col-auto">
            <span>MSI GL Series</span>
          </div>
          <div className="col-auto">
            <span>MSI GE Series</span>
          </div>
        </div>
      </div>

      <ProductSection
        title="Desktops"
        products={desktops}
        seeAllLink="See All Products"
        brandImage="https://cdn.builder.io/api/v1/image/assets/TEMP/9996d18c8ec883ff1da11bd2cd879b82b086e8153114a401faa4b766dec905c0?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
      />

      <div className="container my-5">
        <div className="row">
          <div className="col-auto">
            <div className="d-flex flex-column align-items-center">
              <span>MSI Infinite Series</span>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/12db06f04c1f704cc4edc98bbeaa73cdc462abbd553e2a7474ba66629f8d75c5?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
                alt="MSI Infinite Series"
                className="img-fluid"
              />
            </div>
          </div>
          <div className="col-auto">
            <span>MSI Trident</span>
          </div>
          <div className="col-auto">
            <span>MSI GL Series</span>
          </div>
          <div className="col-auto">
            <span>MSI Nightblade</span>
          </div>
        </div>
      </div>

      <ProductSection
        title="Gaming Monitors"
        products={gamingMonitors}
        seeAllLink="See All Products"
        brandImage="https://cdn.builder.io/api/v1/image/assets/TEMP/d8ff6621435aeac8d1c8f4b49d8ff5d5dbb83142d7288a74d87bca5e456cae0c?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
      />

      <BrandSection brands={brands} />

      <div className="container my-5">
        <h2 className="text-center mb-4">Follow us on Instagram for News, Offers & More</h2>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {instagramPosts.map((post, index) => (
            <div className="col" key={index}>
              <InstagramPost {...post} />
            </div>
          ))}
        </div>
      </div>

      <div className="container my-5">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {instagramPosts.slice(0, 3).map((post, index) => (
            <div className="col" key={index}>
              <InstagramPost {...post} />
            </div>
          ))}
        </div>
      </div>

      <TestimonialCard />

      <ProductFeatures />

      <div className="position-fixed bottom-0 end-0 mx-2 my-4">
        <button className="btn btn-primary rounded-circle" style={{ width: "50px", height: "50px" }}>
          <img src={Icon.Message} alt="" className="img-fluid" />
        </button>
      </div>
    </div>
  );
};

export default ProductDisplay;
