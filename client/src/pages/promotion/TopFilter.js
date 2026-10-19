import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  scroll-behavior: smooth;
  position: relative;
  height: 60px;
`;

const Picker = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 8px;
`;

const Item = styled.div`
  width: 106px;
  height: 41.67px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  color: ${(props) => (props.active ? "#fff" : "#80849C")};
  background: ${(props) =>
    props.active ? "linear-gradient(90deg, #F95B5B 0%, #FFB7AF 100%);" : "#fff"};
  font-weight: 700;
  cursor: pointer;
  padding: 8px;
  border-radius: 5px;
  flex-shrink: 0;
  gap: 6px;
`;

const Span = styled.span`
  font-size: 12px;
`;

const Img = styled.img`
  width: 20px;
`;

const TopFilter = ({ items, onActiveChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  const handleClick = (index) => {
    setActiveIndex(index);
    if (onActiveChange) {
      onActiveChange(items[index].name);
    }

    // Center the clicked tab
    const container = containerRef.current;
    const item = itemRefs.current[index];

    if (container && item) {
      const containerWidth = container.offsetWidth;
      const itemLeft = item.offsetLeft;
      const itemWidth = item.offsetWidth;
      const scrollTo = itemLeft - containerWidth / 2 + itemWidth / 2;
      container.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <Container ref={containerRef} className="scroll-none">
      <Picker>
        {items.map((item, index) => (
          <Item
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
            active={index === activeIndex}
            onClick={() => handleClick(index)}
            className=""
          >
            {item.name === "All" ? (
              <Span>{item.icon}</Span>
            ) : (
              <Img src={item.icon} alt="" />
            )}

            <p className="text-center fs-sm">{item.name}</p>
          </Item>
        ))}
      </Picker>
    </Container>
  );
};

export default TopFilter;
