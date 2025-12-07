import { Link } from "@inertiajs/react";

export default function Pagination({ links }) {

    return (
        <nav className="text-center mt-4 mb-3">
            {links.map((link, index) => (
                <Link
                    preserveScroll
                    key={`${link.label}-${index - 1}`}
                    href={link.url || ""}
                    className={
                        "inline-block py-2 px-3 rounded-lg text-gray-200 text-xs mx-1" +
                        (link.active ? " bg-custom-orange" : " bg-custom-gray-darker") +
                        (!link.url ? " pointer-events-none !text-gray-400 cursor-not-allowed" : " hover:bg-custom-blue")
                    }
                    dangerouslySetInnerHTML={{ __html: link.label }}>
                </Link>
            ))}
        </nav>
    )
}