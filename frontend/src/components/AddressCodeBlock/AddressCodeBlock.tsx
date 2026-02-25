import { Address } from "@/utils/api.schemas";
import { Code, CodeProps } from "@mantine/core";
import React, { ReactNode } from "react";

interface AddressCodeBlockProps extends CodeProps {
  beforeAddress?: ReactNode;
  afterAddress?: ReactNode;
  address?: Address | null;
}

const AddressCodeBlock = ({ beforeAddress, afterAddress, address, ...props }: AddressCodeBlockProps) => {
  if (!address) return null;
  return (
    <Code block {...props}>
      {beforeAddress ? (
        <>
          {beforeAddress}
          <br />
        </>
      ) : null}

      {`${address.street} ${address.houseNumber}
${address.zip}, ${address.city}
${address.country}`}
      <br />
      {afterAddress ? (
        <>
          <br />
          {beforeAddress}
        </>
      ) : null}
    </Code>
  );
};

export default AddressCodeBlock;
