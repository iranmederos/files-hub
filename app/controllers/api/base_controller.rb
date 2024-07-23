class Api::BaseController < ApplicationController
  skip_forgery_protection
  DEFAULT_MIN = 0
  DEFAULT_MAX = 10

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  private

  def render_scoped_list(model, blueprint = nil, view: nil)
    results = apply_scopes(model, list_filters).all
    response.set_header("Content-Filters", current_scopes.to_s)
    render_list results, blueprint, view: view
  end

  def render_list(scope, blueprint = nil, view: nil)
    total = scope.count
    range = list_range
    list = scope.limit(range.last).offset(range.first).order(list_sort)
    response.set_header("Content-Range", "#{scope.model_name.name.underscore.pluralize} #{range.first}-#{range.last}/#{total}")
    render_success blueprint.nil? ? list : blueprint.render(list, view: view)
  end

  def render_success(hash, options: {})
    options = (options || {}).reverse_merge!(status: 200)
    render_json hash, options
  end

  def render_error(hash, options = {})
    options = (options || {}).reverse_merge!(status: :unprocessable_entity)
    render_json hash, options
  end

  def render_json(hash, options = nil)
    options ||= {}
    options.reverse_merge! content_type: "application/json"

    render json: hash, **options
  end

  def list_range
    range = JSON.parse(params[:range] || "[]")
    [range.first || DEFAULT_MIN, range.last || DEFAULT_MAX]
  end

  def list_filters
    JSON.parse(params[:filter] || "{}").deep_symbolize_keys
  end

  def list_sort
    ordering = JSON.parse(params[:sort] || "[]")
    return unless ordering
    field, dir = if ordering.is_a?(Array)
                   field, direction = ordering
                   direction = direction&.downcase&.to_sym
                   direction = default_list_sort_direction unless direction.in?(%i(asc desc))
                   [field, direction]
                 else
                   [ordering, default_list_sort_direction]
                 end
    { (field || default_list_sort_field) => dir }
  end

  def default_list_sort_field
    :id
  end

  def default_list_sort_direction
    :asc
  end

  def record_not_found
    render_error "Not Found"
  end
end
