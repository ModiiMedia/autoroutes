import 'dart:convert';

import 'package:arri_client/arri_client.dart';

class Book implements ArriModel {
  final String id;
  final String name;
  final DateTime createdAt;
  final DateTime updatedAt;
  const Book({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Book.empty() {
    return Book(
      id: "",
      name: "",
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
  }

  factory Book.fromJson(Map<String, dynamic> _input_) {
    final id = typeFromDynamic<String>(_input_["id"], "");
    final name = typeFromDynamic<String>(_input_["name"], "");
    final createdAt = dateTimeFromDynamic(_input_["createdAt"], DateTime.now());
    final updatedAt = dateTimeFromDynamic(_input_["updatedAt"], DateTime.now());
    return Book(
      id: id,
      name: name,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory Book.fromJsonString(String input) {
    return Book.fromJson(json.decode(input));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "id": id,
      "name": name,
      "createdAt": createdAt.toIso8601String(),
      "updatedAt": updatedAt.toIso8601String(),
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("id=$id");
    _queryParts_.add("name=$name");
    _queryParts_.add("createdAt=${createdAt.toIso8601String()}");
    _queryParts_.add("updatedAt=${updatedAt.toIso8601String()}");
    return _queryParts_.join("&");
  }

  @override
  Book copyWith({
    String? id,
    String? name,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Book(
      id: id ?? this.id,
      name: name ?? this.name,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props {
    return [
      id,
      name,
      createdAt,
      updatedAt,
    ];
  }

  @override
  bool operator ==(Object _other_) {
    return _other_ is Book && listsAreEqual(props, _other_.props);
  }

  @override
  int get hashCode => listToHashCode(props);

  @override
  String toString() => "Book ${toJsonString()}";
}

class BookParams implements ArriModel {
  final String bookId;
  const BookParams({
    required this.bookId,
  });

  factory BookParams.empty() {
    return BookParams(bookId: "");
  }

  factory BookParams.fromJson(Map<String, dynamic> _input_) {
    final bookId = typeFromDynamic<String>(_input_["bookId"], "");
    return BookParams(
      bookId: bookId,
    );
  }

  factory BookParams.fromJsonString(String input) {
    return BookParams.fromJson(json.decode(input));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "bookId": bookId,
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("bookId=$bookId");
    return _queryParts_.join("&");
  }

  @override
  BookParams copyWith({
    String? bookId,
  }) {
    return BookParams(
      bookId: bookId ?? this.bookId,
    );
  }

  @override
  List<Object?> get props {
    return [
      bookId,
    ];
  }

  @override
  bool operator ==(Object other) {
    return other is BookParams && listsAreEqual(props, other.props);
  }

  @override
  int get hashCode => listToHashCode(props);
}

class NestedObject implements ArriModel {
  final String id;
  final String content;
  const NestedObject({
    required this.id,
    required this.content,
  });

  factory NestedObject.empty() {
    return NestedObject(
      id: "",
      content: "",
    );
  }

  factory NestedObject.fromJson(Map<String, dynamic> _input_) {
    final id = typeFromDynamic<String>(_input_["id"], "");
    final content = typeFromDynamic<String>(_input_["content"], "");
    return NestedObject(
      id: id,
      content: content,
    );
  }

  factory NestedObject.fromJsonString(String input) {
    return NestedObject.fromJson(json.decode(input));
  }

  @override
  NestedObject copyWith({
    String? id,
    String? content,
  }) {
    return NestedObject(
      id: id ?? this.id,
      content: content ?? this.content,
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "id": id,
      "content": content,
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("id=$id");
    _queryParts_.add("content=$content");
    return _queryParts_.join("&");
  }

  @override
  List<Object?> get props {
    return [
      id,
      content,
    ];
  }

  @override
  bool operator ==(Object other) {
    return other is NestedObject && listsAreEqual(props, other.props);
  }

  @override
  int get hashCode => listToHashCode(props);
}

class ObjectWithEveryType implements ArriModel {
  final String string;
  final bool boolean;
  final DateTime timestamp;
  final double float32;
  final double float64;
  final int int8;
  final int uint8;
  final int int16;
  final int uint16;
  final int int32;
  final int uint32;
  final BigInt int64;
  final BigInt uint64;
  final Enumerator k_enum;
  final NestedObject object;
  final List<bool> array;
  final Map<String, bool> record;
  final Discriminator discriminator;
  final dynamic any;
  const ObjectWithEveryType({
    required this.string,
    required this.boolean,
    required this.timestamp,
    required this.float32,
    required this.float64,
    required this.int8,
    required this.uint8,
    required this.int16,
    required this.uint16,
    required this.int32,
    required this.uint32,
    required this.int64,
    required this.uint64,
    required this.k_enum,
    required this.object,
    required this.array,
    required this.record,
    required this.discriminator,
    required this.any,
  });
  factory ObjectWithEveryType.empty() {
    return ObjectWithEveryType(
      string: "",
      boolean: false,
      timestamp: DateTime.now(),
      float32: 0.0,
      float64: 0.0,
      int8: 0,
      uint8: 0,
      int16: 0,
      uint16: 0,
      int32: 0,
      uint32: 0,
      int64: BigInt.from(0),
      uint64: BigInt.from(0),
      k_enum: Enumerator.foo,
      object: NestedObject.empty(),
      array: [],
      record: {},
      discriminator: DiscriminatorA.empty(),
      any: null,
    );
  }
  factory ObjectWithEveryType.fromJson(Map<String, dynamic> _input_) {
    final string = typeFromDynamic<String>(_input_["string"], "");
    final boolean = typeFromDynamic<bool>(_input_["boolean"], false);
    final timestamp = dateTimeFromDynamic(_input_["timestamp"], DateTime.now());
    final float32 = typeFromDynamic<double>(_input_["float32"], 0.0);
    final float64 = typeFromDynamic<double>(_input_["float64"], 0.0);
    final int8 = typeFromDynamic<int>(_input_["int8"], 0);
    final uint8 = typeFromDynamic<int>(_input_["uint8"], 0);
    final int16 = typeFromDynamic<int>(_input_["int16"], 0);
    final uint16 = typeFromDynamic<int>(_input_["uint16"], 0);
    final int32 = typeFromDynamic<int>(_input_["int32"], 0);
    final uint32 = typeFromDynamic<int>(_input_["uint32"], 0);
    final int64 = bigIntFromDynamic(_input_["int64"], BigInt.zero);
    final uint64 = bigIntFromDynamic(_input_["uint64"], BigInt.zero);
    final k_enum =
        Enumerator.fromString(typeFromDynamic<String>(_input_["enum"], ""));
    final object = _input_["object"] is Map<String, dynamic>
        ? NestedObject.fromJson(_input_["object"])
        : NestedObject.empty();
    final array = _input_["array"] is List
        ? (_input_["array"] as List)
            .map((_el_) => typeFromDynamic<bool>(_el_, false))
            .toList()
        : <bool>[];
    final record = _input_["record"] is Map<String, dynamic>
        ? (_input_["record"] as Map<String, dynamic>).map(
            (_key_, _val_) => MapEntry(
              _key_,
              typeFromDynamic<bool>(_val_, false),
            ),
          )
        : <String, bool>{};
    final discriminator = _input_["discriminator"] is Map<String, dynamic>
        ? Discriminator.fromJson(_input_["discriminator"])
        : Discriminator.empty();
    final any = _input_["any"];
    return ObjectWithEveryType(
      string: string,
      boolean: boolean,
      timestamp: timestamp,
      float32: float32,
      float64: float64,
      int8: int8,
      uint8: uint8,
      int16: int16,
      uint16: uint16,
      int32: int32,
      uint32: uint32,
      int64: int64,
      uint64: uint64,
      k_enum: k_enum,
      object: object,
      array: array,
      record: record,
      discriminator: discriminator,
      any: any,
    );
  }

  factory ObjectWithEveryType.fromJsonString(String _input_) {
    return ObjectWithEveryType.fromJson(json.decode(_input_));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "string": string,
      "boolean": boolean,
      "timestamp": timestamp.toIso8601String(),
      "float32": float32,
      "float64": float64,
      "int8": int8,
      "uint8": uint8,
      "int16": int16,
      "uint16": uint16,
      "int32": int32,
      "uint32": uint32,
      "int64": int64.toString(),
      "uint64": uint64.toString(),
      "enum": k_enum.serialValue,
      "object": object.toJson(),
      "array": array.map((_el_) => _el_).toList(),
      "record": record.map((_key_, _val_) => MapEntry(_key_, _val_)),
      "discriminator": discriminator.toJson(),
      "any": any,
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("string=$string");
    _queryParts_.add("boolean=$boolean");
    _queryParts_.add("timestamp=${timestamp.toIso8601String()}");
    _queryParts_.add("float32=$float32");
    _queryParts_.add("float64=$float64");
    _queryParts_.add("int8=$int8");
    _queryParts_.add("uint8=$uint8");
    _queryParts_.add("int16=$int16");
    _queryParts_.add("uint16=$uint16");
    _queryParts_.add("int32=$int32");
    _queryParts_.add("uint32=$uint32");
    _queryParts_.add("int64=$int64");
    _queryParts_.add("uint64=$uint64");
    _queryParts_.add("enum=${k_enum.serialValue}");
    // objects cannot serialized to query params
    // arrays cannot be serialized to query params
    // objects cannot be serialized to query params
    // nested objects cannot be serialize to query params
    // any's cannot be serialize to query params
    return _queryParts_.join("&");
  }

  @override
  ObjectWithEveryType copyWith({
    String? string,
    bool? boolean,
    DateTime? timestamp,
    double? float32,
    double? float64,
    int? int8,
    int? uint8,
    int? int16,
    int? uint16,
    int? int32,
    int? uint32,
    BigInt? int64,
    BigInt? uint64,
    Enumerator? k_enum,
    NestedObject? object,
    List<bool>? array,
    Map<String, bool>? record,
    Discriminator? discriminator,
    dynamic any,
  }) {
    return ObjectWithEveryType(
      string: string ?? this.string,
      boolean: boolean ?? this.boolean,
      timestamp: timestamp ?? this.timestamp,
      float32: float32 ?? this.float32,
      float64: float64 ?? this.float64,
      int8: int8 ?? this.int8,
      uint8: uint8 ?? this.uint8,
      int16: int16 ?? this.int16,
      uint16: uint16 ?? this.uint16,
      int32: int32 ?? this.int32,
      uint32: uint32 ?? this.uint32,
      int64: int64 ?? this.int64,
      uint64: uint64 ?? this.uint64,
      k_enum: k_enum ?? this.k_enum,
      object: object ?? this.object,
      array: array ?? this.array,
      record: record ?? this.record,
      discriminator: discriminator ?? this.discriminator,
      any: any ?? this.any,
    );
  }

  @override
  List<Object?> get props => [
        string,
        boolean,
        timestamp,
        float32,
        float64,
        int8,
        uint8,
        int16,
        uint16,
        int32,
        uint32,
        int64,
        uint64,
        k_enum,
        object,
        array,
        record,
        discriminator,
        any,
      ];

  @override
  bool operator ==(Object other) {
    return other is ObjectWithEveryType && listsAreEqual(props, other.props);
  }

  @override
  int get hashCode => listToHashCode(props);

  @override
  String toString() {
    return "ObjectWithEveryType ${toJsonString()}";
  }
}

enum Enumerator implements Comparable<Enumerator> {
  foo("FOO"),
  bar("BAR"),
  baz("BAZ");

  const Enumerator(this.serialValue);
  final String serialValue;

  factory Enumerator.fromString(String input) {
    for (final val in values) {
      if (val.serialValue == input) {
        return val;
      }
    }
    return foo;
  }

  @override
  int compareTo(Enumerator other) => name.compareTo(other.name);
}

sealed class Discriminator implements ArriModel {
  String get typeName;
  const Discriminator();

  factory Discriminator.empty() {
    return DiscriminatorA.empty();
  }

  factory Discriminator.fromJson(Map<String, dynamic> _input_) {
    final typeName = typeFromDynamic<String>(_input_["typeName"], "");
    switch (typeName) {
      case "A":
        return DiscriminatorA.fromJson(_input_);
      case "B":
        return DiscriminatorB.fromJson(_input_);
      case "C":
        return DiscriminatorC.fromJson(_input_);
      default:
        return Discriminator.empty();
    }
  }

  factory Discriminator.fromJsonString(String input) {
    return Discriminator.fromJson(json.decode(input));
  }
}

class DiscriminatorA implements Discriminator {
  final String id;
  const DiscriminatorA({
    required this.id,
  });

  @override
  String get typeName => "A";

  factory DiscriminatorA.empty() {
    return DiscriminatorA(
      id: "",
    );
  }

  factory DiscriminatorA.fromJson(Map<String, dynamic> _input_) {
    final id = typeFromDynamic<String>(_input_["id"], "");
    return DiscriminatorA(
      id: id,
    );
  }

  factory DiscriminatorA.fromJsonString(String _input_) {
    return DiscriminatorA.fromJson(json.decode(_input_));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "typeName": typeName,
      "id": id,
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("typeName=$typeName");
    _queryParts_.add("id=$id");
    return _queryParts_.join("&");
  }

  @override
  DiscriminatorA copyWith({
    String? id,
  }) {
    return DiscriminatorA(
      id: id ?? this.id,
    );
  }

  @override
  List<Object?> get props {
    return [
      typeName,
      id,
    ];
  }

  @override
  bool operator ==(Object other) {
    return other is DiscriminatorA && listsAreEqual(props, other.props);
  }

  @override
  int get hashCode => listToHashCode(props);
}

class DiscriminatorB implements Discriminator {
  final String id;
  final String name;
  const DiscriminatorB({
    required this.id,
    required this.name,
  });

  @override
  String get typeName => "B";

  factory DiscriminatorB.empty() {
    return DiscriminatorB(
      id: "",
      name: "",
    );
  }

  factory DiscriminatorB.fromJson(Map<String, dynamic> _input_) {
    final id = typeFromDynamic<String>(_input_["id"], "");
    final name = typeFromDynamic<String>(_input_["name"], "");
    return DiscriminatorB(
      id: id,
      name: name,
    );
  }

  factory DiscriminatorB.fromJsonString(String _input_) {
    return DiscriminatorB.fromJson(json.decode(_input_));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "typeName": typeName,
      "id": id,
      "name": name,
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParams_ = <String>[];
    _queryParams_.add("typeName=B");
    _queryParams_.add("id=$id");
    _queryParams_.add("name=$name");
    return _queryParams_.join("&");
  }

  @override
  DiscriminatorB copyWith({
    String? id,
    String? name,
  }) {
    return DiscriminatorB(
      id: id ?? this.id,
      name: name ?? this.name,
    );
  }

  @override
  List<Object?> get props {
    return [
      id,
      name,
    ];
  }

  @override
  bool operator ==(Object other) {
    return other is DiscriminatorB && listsAreEqual(props, other.props);
  }

  @override
  int get hashCode => listToHashCode(props);
}

class DiscriminatorC implements Discriminator {
  final String id;
  final String name;
  final DateTime date;
  const DiscriminatorC({
    required this.id,
    required this.name,
    required this.date,
  });

  @override
  String get typeName => "C";

  factory DiscriminatorC.empty() {
    return DiscriminatorC(
      id: "",
      name: "",
      date: DateTime.now(),
    );
  }

  factory DiscriminatorC.fromJson(Map<String, dynamic> _input_) {
    final String id = typeFromDynamic<String>(_input_["id"], "");
    final String name = typeFromDynamic<String>(_input_["name"], "");
    final DateTime date = dateTimeFromDynamic(_input_["date"], DateTime.now());
    return DiscriminatorC(
      id: id,
      name: name,
      date: date,
    );
  }

  factory DiscriminatorC.fromJsonString(String _input_) {
    return DiscriminatorC.fromJson(json.decode(_input_));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{
      "typeName": typeName,
      "id": id,
      "name": name,
      "date": date.toIso8601String(),
    };
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    _queryParts_.add("typeName=$typeName");
    _queryParts_.add("id=$id");
    _queryParts_.add("name=$name");
    _queryParts_.add("date=${date.toIso8601String()}");
    return _queryParts_.join("&");
  }

  @override
  DiscriminatorC copyWith({
    String? id,
    String? name,
    DateTime? date,
  }) {
    return DiscriminatorC(
      id: id ?? this.id,
      name: name ?? this.name,
      date: date ?? this.date,
    );
  }

  @override
  List<Object?> get props {
    return [
      id,
      name,
      date,
    ];
  }

  @override
  bool operator ==(Object other) {
    return other is DiscriminatorC && listsAreEqual(props, other.props);
  }

  @override
  int get hashCode => listToHashCode(props);
}

class ObjectWithOptionalFields implements ArriModel {
  final String? string;
  final bool? boolean;
  final DateTime? timestamp;
  final double? float32;
  final double? float64;
  final int? int8;
  final int? uint8;
  final int? int16;
  final int? uint16;
  final int? int32;
  final int? uint32;
  final BigInt? int64;
  final BigInt? uint64;
  final Enumerator? k_enum;
  final NestedObject? object;
  final List<bool>? array;
  final Map<String, bool>? record;
  final Discriminator? discriminator;
  final dynamic any;
  const ObjectWithOptionalFields({
    this.string,
    this.boolean,
    this.timestamp,
    this.float32,
    this.float64,
    this.int8,
    this.uint8,
    this.int16,
    this.uint16,
    this.int32,
    this.uint32,
    this.int64,
    this.uint64,
    this.k_enum,
    this.object,
    this.array,
    this.record,
    this.discriminator,
    this.any,
  });

  factory ObjectWithOptionalFields.empty() {
    return ObjectWithOptionalFields();
  }

  factory ObjectWithOptionalFields.fromJson(Map<String, dynamic> _input_) {
    final string = nullableTypeFromDynamic<String>(_input_["string"]);
    final boolean = nullableTypeFromDynamic<bool>(_input_["boolean"]);
    final timestamp = nullableDateTimeFromDynamic(_input_["timestamp"]);
    final float32 = nullableTypeFromDynamic<double>(_input_["float32"]);
    final float64 = nullableTypeFromDynamic<double>(_input_["float64"]);
    final int8 = nullableTypeFromDynamic<int>(_input_["int8"]);
    final uint8 = nullableTypeFromDynamic<int>(_input_["uint8"]);
    final int16 = nullableTypeFromDynamic<int>(_input_["int16"]);
    final uint16 = nullableTypeFromDynamic<int>(_input_["uint16"]);
    final int32 = nullableTypeFromDynamic<int>(_input_["int32"]);
    final uint32 = nullableTypeFromDynamic<int>(_input_["uint32"]);
    final int64 = nullableBigIntFromDynamic(_input_["int64"]);
    final uint64 = nullableBigIntFromDynamic(_input_["uint64"]);
    final k_enum = _input_["enum"] is String
        ? Enumerator.fromString(_input_["enum"])
        : null;
    final object = _input_["object"] is Map
        ? NestedObject.fromJson(_input_["object"])
        : null;
    final array = _input_["array"] is List
        ? (_input_["array"] as List)
            .map((_el_) => typeFromDynamic<bool>(_el_, false))
            .toList()
        : null;
    final record = _input_["record"] is Map
        ? (_input_["record"] as Map<String, dynamic>).map((_key_, _val_) =>
            MapEntry(_key_, typeFromDynamic<bool>(_val_, false)))
        : null;
    final discriminator = _input_["discriminator"] is Map
        ? Discriminator.fromJson(_input_["discriminator"])
        : null;
    final any = _input_["any"];
    return ObjectWithOptionalFields(
      string: string,
      boolean: boolean,
      timestamp: timestamp,
      float32: float32,
      float64: float64,
      int8: int8,
      uint8: uint8,
      int16: int16,
      uint16: uint16,
      int32: int32,
      uint32: uint32,
      int64: int64,
      uint64: uint64,
      k_enum: k_enum,
      object: object,
      array: array,
      record: record,
      discriminator: discriminator,
      any: any,
    );
  }
  factory ObjectWithOptionalFields.fromJsonString(String input) {
    return ObjectWithOptionalFields.fromJson(json.decode(input));
  }

  @override
  Map<String, dynamic> toJson() {
    final _output_ = <String, dynamic>{};
    if (string != null) _output_["string"] = string;
    if (boolean != null) _output_["boolean"] = boolean;
    if (timestamp != null) _output_["timestamp"] = timestamp!.toIso8601String();
    if (float32 != null) _output_["float32"] = float32;
    if (float64 != null) _output_["float64"] = float64;
    if (int8 != null) _output_["int8"] = int8;
    if (uint8 != null) _output_["uint8"] = uint8;
    if (int16 != null) _output_["int16"] = int16;
    if (uint16 != null) _output_["uint16"] = uint16;
    if (int32 != null) _output_["int32"] = int32;
    if (uint32 != null) _output_["uint32"] = uint32;
    if (int64 != null) _output_["int64"] = int64!.toString();
    if (uint64 != null) _output_["uint64"] = uint64!.toString();
    if (k_enum != null) _output_["enum"] = k_enum!.serialValue;
    if (object != null) _output_["object"] = object!.toJson();
    if (array != null) _output_["array"] = array!.map((_el_) => _el_).toList();
    if (record != null)
      _output_["record"] =
          record!.map((_key_, _val_) => MapEntry(_key_, _val_));
    if (discriminator != null)
      _output_["discriminator"] = discriminator!.toJson();
    if (any != null) _output_["any"] = any;
    return _output_;
  }

  @override
  String toJsonString() {
    return json.encode(toJson());
  }

  @override
  String toUrlQueryParams() {
    final _queryParts_ = <String>[];
    if (string != null) _queryParts_.add("string=$string");
    if (boolean != null) _queryParts_.add("boolean=$boolean");
    if (timestamp != null)
      _queryParts_.add("timestamp=${timestamp!.toIso8601String()}");
    if (float32 != null) _queryParts_.add("float32=$float32");
    if (float64 != null) _queryParts_.add("float64=$float64");
    if (int8 != null) _queryParts_.add("int8=$int8");
    if (uint8 != null) _queryParts_.add("uint8=$uint8");
    if (int16 != null) _queryParts_.add("int16=$int16");
    if (uint16 != null) _queryParts_.add("uint16=$uint16");
    if (int32 != null) _queryParts_.add("int32=$int32");
    if (uint32 != null) _queryParts_.add("uint32=$uint32");
    if (int64 != null) _queryParts_.add("int64=$int64");
    if (uint64 != null) _queryParts_.add("uint64=$uint64");
    if (k_enum != null) _queryParts_.add("enum=${k_enum!.serialValue}");
    print(
        "[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/object.");
    print(
        "[WARNING] arrays cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/array.");
    print(
        "[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/record.");
    print(
        "[WARNING] nested objects cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/discriminator.");
    print(
        "[WARNING] any's cannot be serialized to query params. Skipping field at /ObjectWithOptionalFields/any.");
    return _queryParts_.join("&");
  }

  @override
  ObjectWithOptionalFields copyWith({
    String? Function()? string,
    bool? Function()? boolean,
    DateTime? Function()? timestamp,
    double? Function()? float32,
    double? Function()? float64,
    int? Function()? int8,
    int? Function()? uint8,
    int? Function()? int16,
    int? Function()? uint16,
    int? Function()? int32,
    int? Function()? uint32,
    BigInt? Function()? int64,
    BigInt? Function()? uint64,
    Enumerator? Function()? k_enum,
    NestedObject? Function()? object,
    List<bool>? Function()? array,
    Map<String, bool>? Function()? record,
    Discriminator? Function()? discriminator,
    dynamic Function()? any,
  }) {
    return ObjectWithOptionalFields(
      string: string != null ? string() : this.string,
      boolean: boolean != null ? boolean() : this.boolean,
      timestamp: timestamp != null ? timestamp() : this.timestamp,
      float32: float32 != null ? float32() : this.float32,
      float64: float64 != null ? float64() : this.float64,
      int8: int8 != null ? int8() : this.int8,
      uint8: uint8 != null ? uint8() : this.uint8,
      int16: int16 != null ? int16() : this.int16,
      uint16: uint16 != null ? uint16() : this.uint16,
      int32: int32 != null ? int32() : this.int32,
      uint32: uint32 != null ? uint32() : this.uint32,
      int64: int64 != null ? int64() : this.int64,
      uint64: uint64 != null ? uint64() : this.uint64,
      k_enum: k_enum != null ? k_enum() : this.k_enum,
      object: object != null ? object() : this.object,
      array: array != null ? array() : this.array,
      record: record != null ? record() : this.record,
      discriminator:
          discriminator != null ? discriminator() : this.discriminator,
      any: any != null ? any() : this.any,
    );
  }

  @override
  List<Object?> get props => [
        string,
        boolean,
        timestamp,
        float32,
        float64,
        int8,
        uint8,
        int16,
        uint16,
        int32,
        uint32,
        int64,
        uint64,
        k_enum,
        object,
        array,
        record,
        discriminator,
        any,
      ];

  @override
  bool operator ==(Object other) {
    return other is ObjectWithOptionalFields &&
        listsAreEqual(props, other.props);
  }

  @override
  int get hashCode => listToHashCode(props);

  @override
  String toString() {
    return "ObjectWithOptionalFields ${toJsonString()}";
  }
}
