const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
    test("Test for one property, firstName", () => {
        const result = sqlForPartialUpdate(
            { firstName: "Aliya" },
            { firstName: "firstName", fF2: "f2" });
        expect(result).toEqual({
          setCols: "\"firstName\"=$1",
          values: ["Aliya"],
        });
      });

    test("Test for multi properties", () => {
      const result = sqlForPartialUpdate(
        {}
      )
    })
});