import { useEffect } from "react";

export default function SEO({ title, description, keywords }) {
  useEffect(() => {
    document.title = title;

    let desc = document.querySelector("meta[name='description']");
    let keys = document.querySelector("meta[name='keywords']");

    if (!desc) {
      desc = document.createElement("meta");
      desc.name = "description";
      document.head.appendChild(desc);
    }

    if (!keys) {
      keys = document.createElement("meta");
      keys.name = "keywords";
      document.head.appendChild(keys);
    }

    desc.content = description;
    keys.content = keywords;
  }, [title, description, keywords]);

  return null;
}
