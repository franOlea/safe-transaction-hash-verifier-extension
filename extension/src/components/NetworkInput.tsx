import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Array of all network options to populate the dropdown
const NETWORKS: string[] = [
  "arbitrum",
  // "aurora",
  // "avalanche",
  "base",
  // "base-sepolia",
  // "berachain",
  // "blast",
  // "bsc",
  // "celo",
  "ethereum",
  // "gnosis",
  // "gnosis-chiado",
  // "ink",
  // "linea",
  // "mantle",
  // "optimism",
  // "polygon",
  // "polygon-zkevm",
  // "scroll",
  "sepolia",
  // "sonic",
  // "unichain",
  // "worldchain",
  // "xlayer",
  // "zksync",
];

interface NetworkInputProps {
  selectedNetwork: string;
  onChange: (network: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const NetworkInput: React.FC<NetworkInputProps> = ({
  selectedNetwork,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`network-input ${className}`}>
      <Select
        value={selectedNetwork}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="network-select">
          <SelectValue placeholder="Select a network" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {NETWORKS.map((network) => (
              <SelectItem key={network} value={network}>
                {/* Format the network name for better display */}
                {network.charAt(0).toUpperCase() +
                  network.slice(1).replace(/-/g, " ")}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default NetworkInput;
