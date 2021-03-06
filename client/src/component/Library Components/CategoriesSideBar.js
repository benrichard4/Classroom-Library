import React, { useEffect, useState } from "react";
import styled from "styled-components";

//component for displaying the categories side bar in the library browser
const CategoriesSideBar = ({
  setAddFilter,
  setRemoveFilter,
  state,
  currentTeacher,
}) => {
  const [allCategories, setAllCategories] = useState({});
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //for each category, fetch the information and save it to state
    if (currentTeacher) {
      currentTeacher.categories.forEach((category) => {
        fetch(`/categories/${category}`)
          .then((res) => res.json())
          .then((receivedCategories) => {
            if (receivedCategories.status === 200) {
              setCounter(counter + 1);
              let addedCategories = receivedCategories.data.filters;
              setAllCategories({ ...allCategories, ...addedCategories });
            }
          });
      });
    }
  }, []);

  //keep the loading true until all of the categories have been loaded
  useEffect(() => {
    if (currentTeacher) {
      if (counter === currentTeacher.categories.length) {
        setLoading(false);
      }
    }
  }, [counter]);

  //add or remove categories depending on what was selected
  const handleOnChange = (e) => {
    if (e.target.checked) {
      setAddFilter(e.target.value);
    } else {
      setRemoveFilter(e.target.value);
    }
  };

  return (
    loading === false &&
    allCategories && (
      <Container>
        {Object.keys(allCategories).map((filters, index) => {
          return (
            <FormStyle key={index}>
              <FilterName>
                {filters.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase()}
              </FilterName>
              <Divider />
              <FilterOptionContainer myindex={index === 0}>
                {allCategories[filters].map((filter, index) => {
                  return (
                    <FilterOption key={index}>
                      <input
                        style={{ cursor: "pointer" }}
                        type="checkbox"
                        name={filters === "type" ? "type" : filters}
                        id={filter}
                        value={filter}
                        checked={
                          state.selectedFilters.length === 0
                            ? false
                            : state.selectedFilters.find((category) => {
                                return category === filter;
                              })
                        }
                        onChange={(e) => {
                          handleOnChange(e);
                        }}
                      ></input>
                      <LabelStyle htmlFor={filter}>{filter}</LabelStyle>
                    </FilterOption>
                  );
                })}
              </FilterOptionContainer>
            </FormStyle>
          );
        })}
      </Container>
    )
  );
};

const Container = styled.div`
  width: 95%;
  position: relative;
  margin: 0 auto;
`;

const FormStyle = styled.form`
  margin-top: 10px;
  box-shadow: 0 0 5px 2px lightblue inset;
  border-radius: 2px;
  padding: 10px;
`;

const FilterName = styled.p`
  margin-top: 5px;
  font-size: calc(12px + 0.3vw);
`;

const Divider = styled.hr`
  margin: 0 auto;
`;
const FilterOptionContainer = styled.div`
  margin: 5px 5px 10px 5px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 2px 15px;
  min-height: ${({ myindex }) => (myindex ? "50px" : "100px")};
  max-width: 98%;
  height: 100%;
  width: 100%;
`;

const FilterOption = styled.div`
  margin: 3px 5px;
  &:hover {
    color: rgb(168, 82, 132);
  }
`;

const LabelStyle = styled.label`
  margin-left: 3px;
  font-size: calc(12px + 0.3vw);
  cursor: pointer;
`;

export default CategoriesSideBar;
