
import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  position: fixed;
  width: 25rem;
  height: 300px;
  overflow: hidden;
  margin: 0 auto;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  z-index: 50;
`;

const Picker = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease-out;
  z-index: 10;
  position: relative;
`;

const Item = styled.div`
  height: 40.67px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => (props.active ? "black" : "#768096")};
  font-weight: 700;
  width: 100%;
  cursor: pointer;
  z-index: 20;
  position: relative;
`;

const HighlightRow = styled.div`
  position: absolute;
  height: 40.67px;
  width: 100%;
  top: 170px;
  background: #f0f0f0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 5;
`;

const ShadowTop = styled.div`
  position: absolute;
  top: 0;
  height: 60px;
  width: 100%;
  // background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
  z-index: 30;
`;

const ShadowBottom = styled.div`
  position: absolute;
  bottom: 0;
  height: 60px;
  width: 100%;
  // background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
  z-index: 30;
`;

const FilterName = ({ items, onActiveChange, openAll, setOpenAll }) => {
  const pickerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleClick = (index) => {
    setActiveIndex(index);
    if (onActiveChange) {
      onActiveChange(items[index].name, items[index].level);
    }

    if (pickerRef.current) {
      const itemHeight = 40.67;
      const translateY = -(index * itemHeight) + 130; // center over highlight
      pickerRef.current.style.transform = `translateY(${translateY}px)`;
    }
  };

  useEffect(() => {
    if (pickerRef.current) {
      const itemHeight = 40.67;
      const translateY = -(activeIndex * itemHeight) + 130;
      pickerRef.current.style.transform = `translateY(${translateY}px)`;
    }
  }, [activeIndex]);

  return (
    <>
      <div className={openAll ? "overlay-section block" : "hidden"}></div>
      <div className={openAll ? "block" : "hidden"}>
        <Container className="filter-section bg-body">
          <div
            className="flex justify-between px-4 py-2 z-40 relative bg-light"
            
          >
            <button className="text-black" onClick={() => setOpenAll(false)}>
              Cancel
            </button>
            <button className="text-yellow-600" onClick={() => setOpenAll(false)}>
              Confirm
            </button>
          </div>

          {/* Highlight bar */}
          <HighlightRow />

          {/* Shadows */}
          <ShadowTop />
          <ShadowBottom />

          {/* Items */}
          <Picker ref={pickerRef}>
            {items.map((item, index) => (
              <Item
                key={index}
                active={index === activeIndex}
                onClick={() => handleClick(index)}
              >
                {item.name}
              </Item>
            ))}
          </Picker>
        </Container>
      </div>
    </>
  );
};

export default FilterName;
