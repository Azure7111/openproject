#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

# This is an alternative to retrieve_query in the old queryies helper.
# Differences being that it's not looking to the session and also existing
# queries will be augmented with the params data passed with them.
module Api::Experimental::Concerns::QueryLoading

  private

  def init_query
    if !params[:query_id].blank?
      @query = Query.find(params[:query_id])
      @query.project = @project if @query.project.nil?
    else
      @query = Query.new({ name: "_", :project => @project },
                         :initialize_with_default_filter => no_query_params_provided?)
    end
    prepare_query
    @query
  end

  def prepare_query
    @query.is_public = false unless User.current.allowed_to?(:manage_public_queries, @project) || User.current.admin?
    view_context.add_filter_from_params if params[:fields] || params[:f] || params[:accept_empty_query_fields]
    @query.group_by = params[:group_by] if params[:group_by].present?
    @query.sort_criteria = prepare_sort_criteria if params[:sort]
    @query.display_sums = params[:display_sums] if params[:display_sums].present?
    @query.column_names = params[:c] if params[:c]
    @query.column_names = nil if params[:default_columns]
    @query.name = params[:name] if params[:name]
    @query.is_public = params[:is_public] if params[:is_public]
  end

  def prepare_sort_criteria
    # Note: There was a convention to have sortation strings in the form "type:desc,status:asc".
    # For the sake of not breaking from convention we encoding/decoding the sortation.
    params[:sort].split(',').collect{|p| [p.split(':')[0], p.split(':')[1] || 'asc']}
  end

  def no_query_params_provided?
    (params.keys & %w(group_by c fields f sort is_public name display_sums)).empty?
  end

  def allowed_links_on_query(query, user)
    links = {}
    QueryPolicy.new(user).tap do |auth|
      new_query = Query.new(project: @project)
      links[:create]      = api_experimental_queries_path      if auth.allowed?(new_query,
                                                                                :create)
      links[:update]      = api_experimental_query_path(query) if auth.allowed?(query,
                                                                                :update)
      links[:delete]      = api_experimental_query_path(query) if auth.allowed?(query,
                                                                                :delete)
      links[:publicize]   = api_experimental_query_path(query) if auth.allowed?(query,
                                                                                :publicize)
      links[:depublicize] = api_experimental_query_path(query) if auth.allowed?(query,
                                                                                :depublicize)
      links[:star]        = query_route_from_grape('star', query) if auth.allowed?(query,
                                                                                   :star)
      links[:unstar]      = query_route_from_grape('unstar', query) if auth.allowed?(query,
                                                                                     :unstar)
    end

    links
  end
end
