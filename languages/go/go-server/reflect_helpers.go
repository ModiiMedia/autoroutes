package arri

import (
	"reflect"
	"strings"

	"github.com/iancoleman/strcase"
)

func isOptionalType(input reflect.Type) bool {
	t := input
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}
	return t.Kind() == reflect.Struct && strings.HasPrefix(t.Name(), "Option[")
}

func optionalHasValue(value *reflect.Value) bool {
	target := value
	if target.Kind() == reflect.Ptr {
		if target.IsNil() {
			return false
		}
		el := value.Elem()
		target = &el
	}
	isSome := target.Field(1)
	return isSome.Bool()
}

func isNullableType(input reflect.Type) bool {
	t := input
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}
	return t.Kind() == reflect.Struct && strings.HasPrefix(t.Name(), "Nullable[")
}

func nullableHasValue(val *reflect.Value) bool {
	target := val
	if target.Kind() == reflect.Ptr {
		if target.IsNil() {
			return false
		}
		el := val.Elem()
		target = &el
	}
	isSet := target.Field(1)
	return isSet.Bool()
}

func getSerialKey(field *reflect.StructField, keyCasing KeyCasing) string {
	keyTag := field.Tag.Get("key")
	if len(keyTag) > 0 {
		return keyTag
	}
	switch keyCasing {
	case KeyCasingCamelCase:
		return strcase.ToLowerCamel(field.Name)
	case KeyCasingPascalCase:
		return field.Name
	case KeyCasingSnakeCase:
		return strcase.ToSnake(field.Name)
	}
	return strcase.ToLowerCamel(field.Name)
}
