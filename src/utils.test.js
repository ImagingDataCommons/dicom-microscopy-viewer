import dcmjs from "dcmjs";

import {
  getMeasurementContentItem,
  getTextEvaluationContentItem,
} from "./utils";

import Enums from "./enums";

describe("utils", () => {
  describe("getMeasurementContentItem", () => {
    it("instantiates a valid content item", () => {
      const value = 123;
      const unitCodedConceptValue = "123";
      const unitCodedConceptMeaning = "Something";
      const nameCodedConceptValue = "123";
      const nameCodedConceptMeaning = "Something";

      const result = getMeasurementContentItem(
        value,
        nameCodedConceptValue,
        nameCodedConceptMeaning,
        unitCodedConceptValue,
        unitCodedConceptMeaning
      );

      const expectedResult = new dcmjs.sr.valueTypes.NumContentItem({
        name: new dcmjs.sr.coding.CodedConcept({
          value: nameCodedConceptValue,
          meaning: nameCodedConceptMeaning,
          schemeDesignator: "DCM",
        }),
        value,
        unit: new dcmjs.sr.coding.CodedConcept({
          value: unitCodedConceptValue,
          meaning: unitCodedConceptMeaning,
          schemeDesignator: "DCM",
        }),
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe("getTextEvaluationContentItem", () => {
    it("instantiates a valid content item", () => {
      const value = "text";
      const nameCodedConceptValue = "123";
      const nameCodedConceptMeaning = "Something";

      const result = getTextEvaluationContentItem(
        value,
        nameCodedConceptValue,
        nameCodedConceptMeaning
      );

      const expectedResult = new dcmjs.sr.valueTypes.TextContentItem({
        name: new dcmjs.sr.coding.CodedConcept({
          value: nameCodedConceptValue,
          meaning: nameCodedConceptMeaning,
          schemeDesignator: "DCM",
        }),
        value,
        relationshipType: Enums.RelationshipTypes.HAS_OBS_CONTEXT,
      });

      expect(result).toEqual(expectedResult);
    });
  });
});
