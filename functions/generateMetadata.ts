import { Metadata, ResolvingMetadata } from "next"

export async function generateMetadata(
    { title, image }: any,
    parent: ResolvingMetadata
  ): Promise<Metadata> {
    // optionally access and extend (rather than replace) parent metadata
    const previousImages = (await parent).openGraph?.images || []
   
    return {
      title: title,
      openGraph: {
        images: [image, ...previousImages],
      },
    }
  }