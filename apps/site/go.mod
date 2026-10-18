module github.com/ui8kit/saas-design/apps/site

go 1.23.0

require (
	github.com/a-h/templ v0.3.1001
	github.com/ui8kit/saas-design/packages/blocks/templ v0.0.0
)

require (
	github.com/ui8kit/saas-design/packages/icons/templ v0.0.0 // indirect
	github.com/ui8kit/saas-design/packages/ui/templ v0.0.0 // indirect
)

replace (
	github.com/ui8kit/saas-design/packages/blocks/templ => ../../packages/blocks/templ
	github.com/ui8kit/saas-design/packages/icons/templ => ../../packages/icons/templ
	github.com/ui8kit/saas-design/packages/ui/templ => ../../packages/ui/templ
)
