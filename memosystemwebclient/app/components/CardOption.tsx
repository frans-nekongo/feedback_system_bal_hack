// components/CardOption.tsx
import { Card, CardHeader } from "@nextui-org/react";
import { FaQuestionCircle, FaClipboardList, FaSearch } from "react-icons/fa";

type CardOptionTitle = "Post Question" | "My Tests" | "Search Course";

interface CardOptionProps {
    title: CardOptionTitle;
    onClick: () => void; // Add the onClick prop
}

const iconMap: Record<CardOptionTitle, JSX.Element> = {
    "Post Question": <FaQuestionCircle className="mr-2 text-black" />,
    "My Tests": <FaClipboardList className="mr-2 text-black" />,
    "Search Course": <FaSearch className="mr-2 text-black" />,
};

export default function CardOption({ title, onClick }: CardOptionProps) {
    return (
        <Card isPressable={true} isHoverable={true} className="w-full mb-4 cursor-pointer" onClick={onClick}>
            <CardHeader className="flex items-center">
                {iconMap[title]}
                <p className="text-md font-bold text-black">{title}</p>
            </CardHeader>
        </Card>
    );
}
