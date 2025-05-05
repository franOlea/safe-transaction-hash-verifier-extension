import styled, { keyframes } from "styled-components";

const l1 = keyframes`
  100% {box-shadow: 0 0 0 30px #0000}
`;

const StyledLoader = styled.div`
  width: 40px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #00c853;
  opacity: 0.2;
  box-shadow: 0 0 0 0 #00c85366;
  animation: ${l1} 1s infinite;
`;

export const WaitingState = () => {
  return (
    <div className="flex flex-col items-center gap-8">
      <StyledLoader />
      <p className="text-sm text-gray-600">
        Waiting for transaction confirmation page
      </p>
    </div>
  );
};
