module github.com/ui8kit/saas-design/packages/blocks/templ

go 1.26.0

require (
	github.com/a-h/templ v0.3.1070
	github.com/ui8kit/saas-design/packages/icons/templ v0.0.0
	github.com/ui8kit/saas-design/packages/ui/templ v0.0.0
)

replace (
	github.com/ui8kit/saas-design/packages/icons/templ => ../../icons/templ
	github.com/ui8kit/saas-design/packages/ui/templ => ../../ui/templ
)
