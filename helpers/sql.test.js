const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
    test("Test for one property", () => {
        const resp = sqlForPartialUpdate(
            { firstName: "Januar" },
            { col: "firstName" });
        expect(resp).toEqual({
          setCols: "\"firstName\"=$1",
          values: ["Januar"],
        });
      });

    test("Test for multiple properties", () => {
      const resp = sqlForPartialUpdate(
        { firstName: "Januar", lastName: "Soepangat" },
        { col1: "firstName", col2: "lastName" });
      expect(resp).toEqual({
        setCols: "\"firstName\"=$1, \"lastName\"=$2",
        values: ["Januar", "Soepangat"],
    });
    })
});