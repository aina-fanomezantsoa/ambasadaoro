import { connection } from "next/server";
import { db } from "@/db";
import { HOME_TITLE, homeText } from "@/db/settings";

export function Heading({ title = HOME_TITLE, bio = "" }) {
  return (
    <>
      <h1 className="mt-3 text-lg font-semibold break-words lg:text-[32px] lg:leading-10 lg:font-bold">
        {title}
      </h1>
      {bio && <p className="mt-2 max-w-2xl leading-6 break-words whitespace-pre-line">{bio}</p>}
    </>
  );
}

/** F19: like the background, a failed read must not take the catalogue down. */
export async function HomeText() {
  await connection();
  const text = await homeText(db()).catch((error) => {
    console.error(error);
    return undefined;
  });
  return <Heading {...text} />;
}
