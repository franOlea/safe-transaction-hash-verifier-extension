import styled, { keyframes } from "styled-components";

const l3 = keyframes`
  to {transform: rotate(1turn)}
`;

const StyledLoader = styled.div`
  width: 50px;
  padding: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #00c853;
  --_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: ${l3} 1s infinite linear;
`;

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center gap-8">
      <StyledLoader />
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  );
};
