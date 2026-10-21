import { useEffect, useRef } from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  margin: 0 auto;
  position: relative;
  height: 70px;
  scroll-behavior: smooth;
`;

const Picker = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const Item = styled.div`
  height: 55.67px;
  width: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: ${(props) => (props.active ? "#15131E" : "#606877")};
  font-weight: 700;
  cursor: pointer;
  margin: 10px 5px;
  background: ${(props) =>
    props.active
      ? "var(--Gradient-1, linear-gradient(93deg, var(--mediam-blue) 7.38%, var(--bgblue) 94.48%))"
      : "#201D2B"};
  padding: 10px 30px;
  border-radius: 8px;
  flex-shrink: 0;
`;

const Span = styled.span`
  font-size: 24px;
  color: ${(props) => (props.active ? "#15131E" : "#606877")};
`;

const FilterType = ({ items, activeIndex, onActiveChange }) => {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    const activeItem = itemRefs.current[activeIndex];

    if (container && activeItem) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const offset = itemRect.left - containerRect.left;

      const scroll =
        offset - container.clientWidth / 2 + activeItem.clientWidth / 2;

      container.scrollTo({
        left: container.scrollLeft + scroll,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  return (
    <Container ref={containerRef} className="scroll-none">
      <Picker>
        {items.map((item, index) => (
          <Item
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
            active={index === activeIndex}
            onClick={() => onActiveChange(index, item)}
          >
            <Span active={index === activeIndex}>{item.icon}</Span>
            <p className="flex">{item.name}</p>
          </Item>
        ))}
      </Picker>
    </Container>
  );
};

export default FilterType;
