import XCTest
@testable import SwiftCodegenReference


final class ObjectWithEveryTypeTests: XCTestCase {
    let location = "../../../tests/test-files/ObjectWithEveryType.json"
    let control = ObjectWithEveryType(
        string: "",
        boolean: false,
        timestamp: targetDate,
        float32: 1.5,
        float64: 1.5,
        int8: 1,
        uint8: 1,
        int16: 10,
        uint16: 10,
        int32: 100,
        uint32: 100,
        int64: 1000,
        uint64: 1000,
        enum: Enumerator.baz,
        object: NestedObject(id: "1", content: "hello world"),
        array: [true, false, false],
        record: Dictionary(dictionaryLiteral: ("A", true), ("B", false)),
        discriminator: Discriminator.c(
            DiscriminatorC(
                id: "",
                name: "",
                date: targetDate
            )
        ),
        any: "hello world")

    func testFromJson() throws {
        let objectJson = try String(contentsOfFile: location, encoding: .utf8)
        let result1 = ObjectWithEveryType(JSONString: objectJson) ?? ObjectWithEveryType()
        let result2 = ObjectWithEveryType(JSONString: control.toJSONString() ?? "") ?? ObjectWithEveryType()
        XCTAssertEqual(result1, control)
        XCTAssertEqual(result2, control)
        XCTAssertEqual(result1, result2)
    }
}