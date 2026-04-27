import { InstructionStep } from "@/constants";
import { FC } from "react";

export const InstructionsList: FC<{
  data: InstructionStep;
  isListDecimals?: boolean;
}> = ({ data, isListDecimals = false }) => {
  return (
    <>
      <h3 className="font-semibold text-lg mb-2 text-primary">{data.title}</h3>
      <ul
        className={`${
          isListDecimals ? "list-decimal" : "list-disc"
        } pl-4 space-y-2`}
      >
        {data.items.map((item, index) => (
          <li key={index}>
            {item.heading && (
              <span className="font-medium">{item.heading}</span>
            )}{" "}
            {item.content}
            {item.subItems && (
              <ul className="list-disc pl-4 mt-1">
                {item.subItems.map((subItem, subIndex) => (
                  <li key={subIndex}>{subItem}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default InstructionsList;
