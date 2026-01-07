import { Helmet } from "react-helmet";
export default function SEO({ title, desc, keywords }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
}
